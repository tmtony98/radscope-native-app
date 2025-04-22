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

// console.log("Topic is", TOPIC);


const useMqtt = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
  });
  const [doseRate, setDoseRate] =  useState<number>(0);
  // console.log("status", status);
  // console.log("messages", messages);
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
        // console.log(`Connected to MQTT broker ${BROKER_URL}`);
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
        const message: Message = {
          id: Math.random().toString(36).substr(2, 9),
          topic,
          payload: payload.toString(),
          timestamp: new Date(),
        };
        setMessages((prev) => [message, ...prev]);
        // console.log("payload", message);
        
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

  function getDoserate(data: Message[]) {
    try {
      if (!data || !data.length) return 0;
      // Get the most recent message (first in the array)
      const latestMessage = data[0];
      // Parse the payload string to JSON
      const parsedData = JSON.parse(latestMessage.payload);
      // Extract the doserate value from the parsed JSON
      if (parsedData?.data?.Sensor?.doserate?.value !== undefined) {
        return parsedData.data.Sensor.doserate.value;
      }
      
      return 0;
    } catch (error) {
      console.error("Error extracting doserate value:", error);
      return 0;
    }
  }

  useEffect(() => { 
    if (messages) {
      const newDoseRate = getDoserate(messages);
      // console.log("newDoseRate", newDoseRate);
      setDoseRate(newDoseRate);
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

  return { messages, status  , doseRate };
};

export default useMqtt;
