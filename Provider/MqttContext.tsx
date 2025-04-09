import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import mqtt from 'precompiled-mqtt';
import { Message, ConnectionStatus } from '../Types';
import 'react-native-url-polyfill/auto';

// MQTT Configuration
const BROKER_URL = 'ws://192.168.29.39:8083';
const TOPIC = 'Demo_Topic';
const CLIENT_ID = `mqtt-client-${Math.random().toString(16).substr(2, 8)}`;

// Create context with default values
type MqttContextType = {
  messages: Message[];
  status: ConnectionStatus;
  doseRate: number;
};

const MqttContext = createContext<MqttContextType>({
  messages: [],
  status: { connected: false },
  doseRate: 0,
});

export const useMqttContext = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [doseRate, setDoseRate] = useState<number>(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);

  // Function to extract dose rate from messages
  const getDoserate = (data: Message[]) => {
    try {
      if (!data || !data.length) return 0;
      
      const latestMessage = data[0];
      const parsedData = JSON.parse(typeof latestMessage.payload === 'string' ? latestMessage.payload : latestMessage.payload.toString());
      
      if (parsedData?.data?.Sensor?.doserate?.value !== undefined) {
        return parsedData.data.Sensor.doserate.value;
      }
      
      return 0;
    } catch (error) {
      console.error("Error extracting doserate value:", error);
      return 0;
    }
  };

  // Connect to MQTT broker
  useEffect(() => {
    const connectMqtt = async () => {
      try {
        const client = mqtt.connect(BROKER_URL, {
          clientId: CLIENT_ID,
          clean: true,
          connectTimeout: 10000,
          reconnectPeriod: 5000,
          keepalive: 60,
          rejectUnauthorized: false
        });

        client.on('connect', () => {
          console.log(`Connected to MQTT broker ${BROKER_URL}`);
          
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
          console.log("Received payload:", message);
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
      } catch (error) {
        console.error('Connection error:', error);
        setStatus({
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    connectMqtt();

    // Cleanup function
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true, () => {
          console.log('MQTT connection closed');
        });
      }
    };
  }, []);

  // Update dose rate when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const newDoseRate = getDoserate(messages);
      console.log("Updated dose rate:", newDoseRate);
      setDoseRate(newDoseRate);
    }
  }, [messages]);

  // Context value
  const value = {
    messages,
    status,
    doseRate
  };

  return (
    <MqttContext.Provider value={value}>
      {children}
    </MqttContext.Provider>
  );
}; 