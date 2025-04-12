import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import mqtt from 'precompiled-mqtt';
import { Message, ConnectionStatus , GpsData, BatteryData } from '../Types';
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
  cps: number;
  gps: GpsData | null;
  batteryInfo: BatteryData | null;
  doseRateArray: number[];
  timestampArray: number[];
  timestamp: number;
};



const MqttContext = createContext<MqttContextType>({
  messages: [],
  status: { connected: false },
  doseRate: 0,
  cps: 0,
  timestamp: 0,
  doseRateArray: [],
  timestampArray: [],
  gps: null,
  batteryInfo: null,
});

export const useMqttContext = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [doseRate, setDoseRate] = useState<number>(0);
  const [doseRateArray, setDoseRateArray] = useState<number[]>([]);
  const [cps, setCps] = useState<number>(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const [timestampArray, setTimestampArray] = useState<number[]>([]);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [gps, setGps] = useState< GpsData | null>(null);
  const [batteryInfo, setBatteryInfo] = useState <BatteryData | null>(null);

  // Function to extract dose rate from messages
  // const getDoserate = (data: Message[]) => {
  //   try {
  //     if (!data || !data.length) return 0;
  //     const latestMessage = data[0];
  //     const parsedData = JSON.parse(typeof latestMessage.payload === 'string' ? latestMessage.payload : latestMessage.payload.toString());
  //     if (parsedData?.data?.Sensor?.doserate?.value !== undefined) {
  //       setDoseRateArray((prevArray) => [...prevArray, parsedData.data.Sensor.doserate.value]);
  //       return parsedData.data.Sensor.doserate.value;
  //     }
      
  //     return 0;
  //   } catch (error) {
  //     console.error("Error extracting doserate value:", error);
  //     return 0;
  //   }
  // };

 

  // const getCps = (data: Message[]) => {
  //   try {
  //     if (!data || !data.length) return 0;
  //     const latestMessage = data[0];
  //     const parsedData = JSON.parse(typeof latestMessage.payload === 'string' ? latestMessage.payload : latestMessage.payload.toString());
  //     if (parsedData?.data?.Sensor?.doserate?.cps !== undefined) {
  //       return parsedData.data.Sensor.doserate.cps;
  //     }
      
  //     return 0;
  //   } catch (error) {
  //     console.error("Error extracting cps value:", error);  
  //     return 0;
  //   }
  // };

  // const getTimestamp = (data: Message[]) => {
  //   try {
  //     if (!data || !data.length) return 0;
  //     const latestMessage = data[0];
  //     const parsedData = JSON.parse(typeof latestMessage.payload === 'string' ? latestMessage.payload : latestMessage.payload.toString());
  //     if (parsedData?.data?.Sensor?.timestamp !== undefined) {
  //       return parsedData.data.Sensor.timestamp;
  //     }
      
  //     return 0;
  //   } catch (error) {
  //     console.error("Error extracting timestamp value:", error);
  //     return 0;
  //   }
  // } 

  const extractSensorData = (messages: Message[]) => {
    try {
      if (!messages || !messages.length) return { doseRate: 0, cps: 0, timestamp: 0 };
      const latestMessage = messages[0];
      console.log("latestMessage", latestMessage);
      const parsedData = JSON.parse(typeof latestMessage.payload === 'string' 
        ? latestMessage.payload 
        : latestMessage.payload.toString());
      
      const doseRate = parsedData?.data?.Sensor?.doserate?.value ?? 0;
      const cps = parsedData?.data?.Sensor?.doserate?.cps ?? 0;
      const timestamp = parsedData?.timestamp ?? 0;
      const gps = parsedData?.data?.GPS ?? null;
      const batteryInfo = parsedData?.data?.Attributes ?? null;
     
      console.log("gps", gps);
      
      return { doseRate, cps, timestamp , gps , batteryInfo};
    } catch (error) {
      console.error("Error extracting sensor data:", error);
      return { doseRate: 0, cps: 0, timestamp: 0 };
    }
  }


  //Connect to MQTT broker
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
      const { doseRate, cps, timestamp , gps , batteryInfo } = extractSensorData(messages);
      setDoseRate(doseRate);
      setCps(cps);
      setTimestamp(timestamp);
      setGps(gps);
      setBatteryInfo(batteryInfo);
      setDoseRateArray(prev => [...prev, doseRate]);
      setTimestampArray(prev => [...prev, timestamp]);
    }
  }, [messages]);

  // Context value
  const value = {
    messages,
    status,
    doseRate,
    cps,
    timestamp,
    doseRateArray,
    timestampArray,
    gps,
    batteryInfo
  };

  console.log("doseRate", doseRate);
  console.log("cps", cps);
  console.log("doseRateArray", doseRateArray);
  
  return (
    <MqttContext.Provider value={value}>
      {children}
    </MqttContext.Provider>
  );
}; 