import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import mqtt from 'precompiled-mqtt';
import { Message, ConnectionStatus, GpsData, BatteryData, Device } from '../Types';
import 'react-native-url-polyfill/auto';
import database from '../index.native';
import Doserate from '../model/Doserate';
import { useDeviceContext } from './DeviceContextProvider';
import * as SecureStore from 'expo-secure-store';

const BROKER_URL2 = 'ws://192.168.29.39:8083'; 
// wss://192.168.29.79:1883/
const TOPIC = 'Demo_Topic';

const CLIENT_ID = `mqtt-client-${Math.random().toString(16).substr(2, 8)}`;

type MqttContextType = {
  message: Message;
  messages: Message[];
  status: ConnectionStatus;
  doseRate: number;
  cps: number;
  gps: GpsData | null;
  batteryInfo: BatteryData | null;
  doseRateArray: number[];
  timestampArray: number[];
  timestamp: number;
  spectrum: number[];
};

const MqttContext = createContext<MqttContextType>({
  message: {
    id: '',
    topic: '',
    payload: '',
    timestamp: new Date()
  },
  messages: [],
  status: { connected: false },
  doseRate: 0,
  cps: 0,
  timestamp: 0,
  doseRateArray: [],
  timestampArray: [],
  gps: null,
  batteryInfo: null,
  spectrum: []
});

export const useMqttContext = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const { connectedDevice, setConnectionCallback, isConnecting } = useDeviceContext();

  console.log("connectedDevice in mqtt", connectedDevice);
  console.log("isConnecting in mqtt", isConnecting);
  
  const [message, setMessage] = useState<Message>({
    id: '',
    topic: '',
    payload: '',
    timestamp: new Date()
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  const [doseRate, setDoseRate] = useState<number>(0);
  const [doseRateArray, setDoseRateArray] = useState<number[]>([]);
  const [cps, setCps] = useState<number>(0);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const [timestampArray, setTimestampArray] = useState<number[]>([]);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [gps, setGps] = useState<GpsData | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<BatteryData | null>(null);
  const [spectrum, setSpectrum] = useState<number[]>([])

  const extractSensorData = (messages: Message[]) => {
    try {
      if (!messages || !messages.length)
         return { doseRate: 0, cps: 0, timestamp: 0, gps: null, batteryInfo: null };
      const latestMessage = messages[0];
      const parsedData = JSON.parse(typeof latestMessage.payload === 'string' 
        ? latestMessage.payload 
        : latestMessage.payload.toString());
      console.log("parsedData", parsedData);
      const doseRate = parsedData?.data?.Sensor?.doserate?.value ?? 0;
      const cps = parsedData?.data?.Sensor?.doserate?.cps ?? 0;
      const timestamp = parsedData?.timestamp ?? 0;
      const gps = parsedData?.data?.GPS ?? null;
      const batteryInfo = parsedData?.data?.Attributes ?? null;
      const spectrum = parsedData?.data?.Sensor?.spectrum?.bins ?? null

      return { doseRate, cps, timestamp, gps, batteryInfo, spectrum };
    } catch (error) {
      console.error("Error extracting sensor data:", error);
      return { doseRate: 0, cps: 0, timestamp: 0, gps: null, batteryInfo: null, spectrum: null };
    }
  }

  const saveDoserate = useCallback(async (doserate: number, cps: number, createdAt: number) => {
    const newRecord = await database.write(async () => {
       return  await database.get('doserate').create(record => {
        (record as Doserate).doserate = doserate;
        (record as Doserate).cps = cps;
        (record as Doserate).createdAt = createdAt;
      });
    });
  }, []);

  const connectMqtt = useCallback(async (deviceParam: Device | null) => {
    console.log("connectMqtt called with deviceParam:", deviceParam);
    // Clean up existing connection
    if (clientRef.current) {
      console.log('Disconnecting existing MQTT connection');
      try {
        clientRef.current.end(true, () => {
          console.log('MQTT connection closed before reconnecting');
        });
      } catch (err) {
        console.error('Error ending previous connection', err);
      }
      clientRef.current = null;
    }
    
    // Handle case when no device is provided
    if (!deviceParam?.host) {
      console.log('No device host provided, aborting MQTT connection');
      setStatus({ connected: false, error: 'No device host provided' });
      return;
    }
    
    try {      
      // Create broker URL with proper WebSocket protocol
      const port = deviceParam.port || '8083';
      const brokerUrl = `ws://${deviceParam.host}:${port}`;

      console.log(`Attempting MQTT connection to: ${brokerUrl}`);
      
      // Create client with more detailed options
      const client = mqtt.connect(brokerUrl, {
        clientId: `${CLIENT_ID}_${new Date().getTime()}`, // Add timestamp for uniqueness
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
        keepalive: 60,
        rejectUnauthorized: false,
        // Add more connection options if needed
        // username: 'your_username',
        // password: 'your_password',
      });

      // Log when connection attempt starts
      console.log('MQTT connection attempt started...');
      
      // Set up connect event handler
      client.on('connect', () => {
        // Remove debugger statement that could block execution
        console.log(`Connected successfully to MQTT broker: ${brokerUrl}`);
        
        // Double-check that deviceParam is still available
        if (!deviceParam) {
          console.error('Device information no longer available after connection');
          setStatus({ connected: true, error: 'Device info lost after connection' });
          return;
        }
        
        // Make sure deviceID exists before creating topic
        if (!deviceParam.deviceID) {
          console.error('No device ID available, cannot create subscription topic');
          setStatus({ connected: true, error: 'Missing device ID for topic' });
          return;
        }

        const newTopic = `${TOPIC}/${deviceParam.deviceID}`;
        console.log("Attempting to subscribe to topic:", newTopic);
        
        client.subscribe(newTopic, (err) => {
          if (err) {
            console.error('Subscription error:', err);
            setStatus({ connected: false, error: 'Failed to subscribe to topic' });
          } else {
            console.log('Successfully subscribed to topic:', newTopic);
            setStatus({ connected: true });
          }
        });
      });

      client.on('message', (topic, payload) => {
        // Remove debugger statement
        console.log('Message received on topic:', topic);
        try {
          const payloadStr = payload.toString();
          console.log('Message payload:', payloadStr.substring(0, 100) + (payloadStr.length > 100 ? '...' : ''));
          
          const newMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            topic,
            payload: payloadStr,
            timestamp: new Date(),
          };
          setMessages((prev) => [newMessage, ...prev]);
          setMessage(newMessage);
        } catch (err) {
          console.error('Error processing message:', err);
        }
      });

      // Add a connecting state handler
      client.on('connecting', () => {
        console.log('MQTT client connecting...');
        setStatus({ connected: false, error: 'Connecting...' });
      });
      
      // Improve error handling
      client.on('error', (err) => {
        // Remove debugger statement
        console.error('MQTT error occurred:', err);
        const errorMsg = err instanceof Error ? err.message : 'Connection error';
        console.error('Error details:', errorMsg);
        setStatus({ connected: false, error: errorMsg });
      });

      client.on('offline', () => {
        // Remove debugger statement
        console.log('MQTT client went offline');
        setStatus({ connected: false });
      });

      client.on('reconnect', () => {
        // Remove debugger statement
        console.log('MQTT client attempting to reconnect...');
        setStatus({ connected: false, error: 'Reconnecting...' });
      });
      
      // Add disconnect handler
      client.on('close', () => {
        console.log('MQTT connection closed');
        setStatus({ connected: false });
      });
      
      // Add end handler
      client.on('end', () => {
        console.log('MQTT connection ended');
        setStatus({ connected: false });
      });

      clientRef.current = client;
    } catch (error) {
      console.error('Connection error:', error);
      setStatus({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [clientRef, setStatus]);

  const handleDeviceConnection = useCallback((device: Device | null) => {
    console.log("handleDeviceConnection called with device", device);
    
    if (device && device.host) {
      console.log('MQTT Providerrrrrr: Connecting to device:', device.name, device.host, device.port);
      connectMqtt(device); 
    } else {
      console.log('MQTT Providerrrrrr: No device connected, disconnecting MQTT.');
      connectMqtt(null); 
    }
  }, [connectMqtt]);

  useEffect(() => {
    console.log('MQTT Provider: Registering connection callback with DeviceContext');
    if (setConnectionCallback) {
        const callback = (device: Device | null) => handleDeviceConnection(device);
        setConnectionCallback(() => callback); 
    }

    handleDeviceConnection(connectedDevice);

    return () => {
        console.log("MQTT Provider: Cleaning up MQTT connection.");
        if (clientRef.current) {
            clientRef.current.end(true, () => {
              console.log('MQTT connection closed during cleanup');
            });
            clientRef.current = null; 
        }
        if (setConnectionCallback) {
            setConnectionCallback(() => () => {}); 
        }
    };
  }, [connectedDevice, handleDeviceConnection, setConnectionCallback]);

  useEffect(() => {
    if (messages.length > 0) {
      const { doseRate, cps, timestamp, gps, batteryInfo, spectrum } = extractSensorData(messages);
      setDoseRate(doseRate);
      setCps(cps);
      setTimestamp(timestamp);
      setGps(gps);
      setBatteryInfo(batteryInfo);
      setDoseRateArray(prev => [...prev, doseRate]);
      setTimestampArray(prev => [...prev, timestamp]);
      saveDoserate(doseRate, cps, timestamp);
      setSpectrum(spectrum);
    }
  }, [messages]);

  const value = {
    message,
    messages,
    status,
    doseRate,
    cps,
    timestamp,
    doseRateArray,
    timestampArray,
    gps,
    batteryInfo,
    spectrum
  };

  console.log("spectrum", spectrum);
  
  return (
    <MqttContext.Provider value={value}>
      {children}
    </MqttContext.Provider>
  );
}; 