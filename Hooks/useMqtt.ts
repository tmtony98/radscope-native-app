import { useEffect, useRef, useState, useCallback } from 'react';
// import * as mqtt from 'precompiled-mqtt';
import mqtt from 'precompiled-mqtt';
// import * as mqtt from 'mqtt';
import { Message, ConnectionStatus } from '../Types';
import 'react-native-url-polyfill/auto';

// Changed to use WebSocket protocol and correct port
const BROKER_URL = 'ws://192.168.29.39:8083';
const TOPIC = 'Demo_Topic';
const CLIENT_ID = `mqtt-client-${Math.random().toString(16).substr(2, 8)}`;

console.log("Topic is", TOPIC);


const useMqtt = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [doseRate, setDoseRate] = useState<number>(0);
  console.log("status", status);
  console.log("messages", messages);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  const connect = useCallback(() => {
    try {
      const client = mqtt.connect(BROKER_URL, {
        clientId: CLIENT_ID,
        clean: true,
        connectTimeout: 10000, // Increased timeout to 10 seconds
        reconnectPeriod: 5000, // Increased reconnect period to 5 seconds
        keepalive: 60,
        rejectUnauthorized: false
      });

      client.on('connect', () => {
        console.log(`Connected to MQTT broker ${BROKER_URL}`);
        // Don't set connected status until subscription is confirmed
        client.subscribe(TOPIC, (err) => {
          if (err) {
            console.error('Subscription error:', err);
            setStatus({ 
              connected: false, 
              error: 'Failed to subscribe to topic' 
            });
          } else {
            console.log('Successfully subscribed to topic:', TOPIC);
            setStatus({ connected: true });
          }
        });
      });

      client.on('message', (topic, payload) => {
        try {
          const payloadString = payload.toString();
          
          // Create message with validated payload
          const message: Message = {
            id: Math.random().toString(36).substr(2, 9),
            topic,
            payload: payloadString,
            timestamp: new Date(),
          };
          
          setMessages((prev) => [message, ...prev]);
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
        setStatus({ 
          connected: false, 
          error: err instanceof Error ? err.message : 'Connection error' 
        });
      });

      client.on('offline', () => {
        console.log('MQTT client offline');
        setStatus({ connected: false });
      });

      client.on('reconnect', () => {
        console.log('Reconnecting to MQTT broker...');
        setStatus({ connected: false, error: 'Reconnecting...' });
      });

      clientRef.current = client;

      return () => {
        if (client) {
          client.end(true, () => {
            console.log('MQTT connection closed');
          });
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  function getDoserateWithTimestamp(data: Message[]) {
    console.log("getDoserate function called");
    
    try {
      if (!data || !data.length) return [];
      
      return data.map(message => {
        try {
          // Check if payload is valid before parsing
          if (!message.payload || typeof message.payload !== 'string' || message.payload.trim() === '') {
            console.warn("Empty or invalid payload:", message.payload);
            return {
              doseRate: 0,
              timestamp: message.timestamp
            };
          }
          
          const parsedData = JSON.parse(message.payload);
          
          // Try to get timestamp from the message data, fallback to message timestamp
          let timestamp;
          if (parsedData.timestamp) {
            timestamp = parsedData.timestamp;
          } else {
            // If timestamp is missing, use the message timestamp
            timestamp = message.timestamp;
          }
          
          // Ensure the timestamp is properly formatted
          if (!(timestamp instanceof Date) && typeof timestamp === 'string') {
            // Keep it as string for now, Chart component will handle formatting
          }
          
          const value = parsedData?.data?.Sensor?.doserate?.value !== undefined 
            ? parsedData.data.Sensor.doserate.value 
            : 0;
          
          return {
            doseRate: value,
            timestamp: timestamp
          };
        } catch (error) {
          console.error("Error parsing message:", error, "Payload:", message.payload);
          return {
            doseRate: 0,
            timestamp: message.timestamp
          };
        }
      });
    } catch (error) {
      console.error("Error extracting doserate values:", error);
      return [];
    }
  }

  useEffect(() => { 
    if (messages) {
      const doseRateData = getDoserateWithTimestamp(messages);
      console.log("doseRateData", doseRateData);
      setDoseRate(doseRateData.length > 0 ? doseRateData[0].doseRate : 0);
    }
  }, [messages]);


  useEffect(() => {

    const cleanup = connect();
    return () => {
      cleanup?.();
      if (clientRef.current) {
        clientRef.current.end();
      }
    };
  }, [connect]);

  return { messages, status, doseRate, doseRateData: getDoserateWithTimestamp(messages) };
};

export default useMqtt;
