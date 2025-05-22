import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mqtt from 'precompiled-mqtt';
import 'react-native-url-polyfill/auto';
import database from '../index.native';
import { Alert, BackHandler, NativeModules, Platform } from 'react-native';
import Doserate from '../model/Doserate';
import { Message, ConnectionStatus, GpsData, BatteryData, LiveData, SensorData  , DoserateData } from '../Types';
import RNFS from 'react-native-fs';


interface SensorDataExtract {
  doseRate: number;
  cps: number;
  timestamp: string | number;
  gps: GpsData | null;
  batteryInfo: BatteryData | null;
  spectrum: number[];
}

// MQTT Configuration
const BROKER_URL = 'ws://192.168.29.39:8083'; //office bbd
// const BROKER_URL = 'ws://192.168.1.50:8083'; //office kv

// const BROKER_URL = 'ws://192.168.1.11:8083'; //hostel
// const BROKER_URL = 'ws://192.168.74.213:8083'; //tony phone
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/Radscope';
const DOSERATE_PATH = BASE_PATH + '/Doserate_data';
const SESSION_PATH = BASE_PATH + '/Sessions_data';
// const SESSION_PATH = BASE_PATH + '/Sessions_data';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];



 
// const TOPIC = 'device/GS200/spectrum/GS200X1D83ADD17C168';
// const TOPIC = 'Demo_Topic';
// const CLIENT_ID = `mqtt-client-${Math.random().toString(16).substr(2, 8)}`;

// Create context with default values
type MqttContextType = {
  message: Message;
  messages: Message[];
  status: ConnectionStatus;
  doseRate: number;
  cps: number;
  gps: GpsData | null;
  batteryInfo: BatteryData | null;
  doseRateGraphArray: { doseRate: number; timestamp: number; cps: number }[];
  timestamp: number;
  spectrum:number[];
  connectMqtt: (mqtt_host: string, mqtt_port: number, deviceId: any) => void;
  disconnectMqtt: () => void;
  createDateBasedDirectory: (date?: Date, type?: 'doserate' | "session") => Promise<string>;
  isExternalStorageAvailable: boolean;
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
  doseRateGraphArray: [],
  gps: null,
  batteryInfo: null,
  spectrum:[],
  connectMqtt: () => {},
  disconnectMqtt: () => {},
  createDateBasedDirectory: async () => '',
  isExternalStorageAvailable: false,
  
});

export const useMqttContext = () => useContext(MqttContext);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<Message>({
    id: '',
    topic: '',
    payload: '',
    timestamp: new Date()
  });
  // console.log("message", message);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false });
  // Group related sensor data into a single state object for optimized updates
  const [sensorData, setSensorData] = useState({
    doseRate: 0,
    cps: 0,
    timestamp: 0,
    gps: null as GpsData | null,
    batteryInfo: null as BatteryData | null,
    spectrum: [] as number[]
  });
  const [isExternalStorageAvailable, setIsExternalStorageAvailable] = useState(false);
  // Destructure sensor data for easier access in the component
  const { doseRate, cps, timestamp, gps, batteryInfo, spectrum } = sensorData;
  // Keep doseRateGraphArray separate as it has a different update pattern
  const [doseRateGraphArray, setDoseRateGraphArray] = useState<{ doseRate: number; timestamp: number; cps: number }[]>([]);
  
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const messageQueueRef = useRef<Message[]>([]);
  const processingRef = useRef(false);


  // Memoize the extractSensorData function to prevent unnecessary recreations
  const extractSensorData = useCallback((payload: string): SensorDataExtract => {
    try {
      if (!payload) {
        return { doseRate: 0, cps: 0, timestamp: 0, gps: null, batteryInfo: null, spectrum: [] };
      }
      const parsedData: LiveData = JSON.parse(payload);
      
      // Only log in development
      if (__DEV__) {
        // console.log("parsedData", parsedData);
      }
      return {
        doseRate: parsedData.data.Sensor.doserate.value ?? 0,
        cps: parsedData.data.Sensor.doserate.cps ?? 0,
        timestamp: parsedData.timestamp ?? 0,
        gps: parsedData.data.GPS ?? null,
        batteryInfo: parsedData.data.Attributes ?? null,
        spectrum: parsedData.data.Sensor.spectrum.bins ?? []
      };
    } catch (error) {
      console.error("Error extracting sensor data:", error);
      return { doseRate: 0, cps: 0, timestamp: 0, gps: null, batteryInfo: null, spectrum: [] };
    }
  }, []);

  //Move database operations outside of the render cycle
  const saveDoserate = useCallback(async (doserate: number, cps: number, createdAt: number) => {
    try {
      await database.write(async () => {
        return await database.get('doserate').create(record => {
          (record as Doserate).doserate = doserate;
          (record as Doserate).cps = cps;
          (record as Doserate).createdAt = createdAt;
        });
      });
    } catch (error) {
      console.error("Error saving doserate:", error);
    }
  }, []);


  const checkPermissionsAfterSettings = async () => {
    try {
      const result = await NativeModules.PermissionFile.checkAndGrantPermission();
      if (result) {
        setIsExternalStorageAvailable(true);
        // Initialize directories after permissions are granted
        await initializeDirectory();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to check permissions after settings:", error);
      return false;
    }
  };

  const AskPermission = async () : Promise <boolean> => {
    try {
      
      console.log("Checking storage permission");
      const result = await NativeModules.PermissionFile.checkAndGrantPermission();
      console.log(result ? "Permission granted" : "Permission not granted yet");
      
      if (result) {
        // Permission granted
        
        setIsExternalStorageAvailable(true);
        return true;
      } else {
        // Permission denied
        setIsExternalStorageAvailable(false);
        
        // Show alert with options to go to settings or exit app
        Alert.alert(
          "Permission Required",
          "Storage permission is required for this app to function properly.",
          [
            { 
              text: "Go to Settings", 
              onPress: async () => {
                try {
                  // Use the dedicated method to open app settings directly
                  await NativeModules.PermissionFile.openAppSettings();
                  
                  // Set a timeout to check permissions after user returns from settings
                  // This gives time for the user to grant permissions and return to the app
                  setTimeout(async () => {
                    const granted = await checkPermissionsAfterSettings();
                    if (granted) {
                      console.log("Permissions granted after settings!");
                    } else {
                      console.log("Permissions still not granted after settings");
                      // Could show another alert here if needed
                    }
                  }, 1000);
                } catch (error) {
                  console.error("Failed to open settings:", error);
                }
              }
            },
            { 
              text: "Exit App", 
              onPress: () => {
                // Force close the app using a combination of methods for better reliability
                BackHandler.exitApp();
                // For Android, we can use a more forceful approach if needed
                if (Platform.OS === 'android') {
                  // This is a more aggressive way to exit the app
                  NativeModules.DevSettings?.reload(); // First try to reload (which disrupts the app)
                  setTimeout(() => {
                    BackHandler.exitApp(); // Then try to exit again after a short delay
                  }, 100);
                }
              },
              style: 'cancel'
            }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      
      // Show error alert with options
      Alert.alert(
        "Permission Error",
        "Failed to check storage permissions.",
        [
          { 
            text: "Go to Settings", 
            onPress: async () => {
              try {
                // Try to open settings even if the check failed
                await NativeModules.PermissionFile.openAppSettings();
                
                // Set a timeout to check permissions after user returns from settings
                setTimeout(async () => {
                  const granted = await checkPermissionsAfterSettings();
                  if (granted) {
                    console.log("Permissions granted after settings!");
                  } else {
                    console.log("Permissions still not granted after settings");
                  }
                }, 1000);
              } catch (error) {
                console.error("Failed to open settings:", error);
              }
            }
          },
          { 
            text: "Exit App", 
            onPress: () => {
              // Force close using the same reliable approach
              BackHandler.exitApp();
              if (Platform.OS === 'android') {
                NativeModules.DevSettings?.reload();
                setTimeout(() => {
                  BackHandler.exitApp();
                }, 100);
              }
            },
            style: 'cancel'
          }
        ]
      );
      return false;
    } 
};

// Initialize the base directory
const initializeDirectory = async () => {
  try {
    // Create base directory if it doesn't exist
    const baseExists = await RNFS.exists(BASE_PATH);
    if (!baseExists) {
      await RNFS.mkdir(BASE_PATH);
      console.log('Created base directory:', BASE_PATH);
    }

    // Create doserate_data directory if it doesn't exist
    const doserateExists = await RNFS.exists(DOSERATE_PATH);
    if (!doserateExists) {
      await RNFS.mkdir(DOSERATE_PATH);
      console.log('Created doserate data directory:', DOSERATE_PATH);
    }
    // Create spectrum_data directory if it doesn't exist
    const spectrumExists = await RNFS.exists(SESSION_PATH);
    if (!spectrumExists) {
      await RNFS.mkdir(SESSION_PATH);
      console.log('Created spectrum data directory:', SESSION_PATH);
    }
  } catch (error) {
    console.error('Error initializing directories:', error);
  }
};

 // useEffect for checking storage permission
useEffect(() => {
 if (isExternalStorageAvailable){
  return
 }
  if (!isExternalStorageAvailable) {
      AskPermission(); // runs on first time when message state is created
    }
  }, [message]);


useEffect(() => {
  initializeDirectory();
}, []); // Initialize directory when component mounts





const createDateBasedDirectory = async (date = new Date(), type?: 'doserate' | 'session') => {
  const year = date.getFullYear().toString();
  const month = MONTHS[date.getMonth()]; // Get month name instead of number
  const day = date.getDate().toString().padStart(2, '0');
  
  if (type === 'doserate') {
    const doseratePath = `${DOSERATE_PATH}/${year}`;
    const monthPath = `${doseratePath}/${month}`;
    const dayPath = `${monthPath}/${day}`;
    
    try {
      const yearExists = await RNFS.exists(doseratePath);
      if (!yearExists) {
        await RNFS.mkdir(doseratePath);
      }
      
      const monthExists = await RNFS.exists(monthPath);
      if (!monthExists) {
        await RNFS.mkdir(monthPath);
      }
      
      const dayExists = await RNFS.exists(dayPath);
      if (!dayExists) {
        await RNFS.mkdir(dayPath);
      }
      
      return dayPath; // Return the path of the day directory eg: /radscope/doserate/2025/05/06
    } catch (error) {
      console.error('Error creating date-based directory:', error);
      throw error;
    }
  }
  else{
    const sessionPath = `${SESSION_PATH}/${year}`;
    const monthPath = `${sessionPath}/${month}`;
    const dayPath = `${monthPath}/${day}`;
    
    try {
      const yearExists = await RNFS.exists(sessionPath);
      if (!yearExists) {
        await RNFS.mkdir(sessionPath);
      }
      
      const monthExists = await RNFS.exists(monthPath);
      if (!monthExists) {
        await RNFS.mkdir(monthPath);
      }
      
      const dayExists = await RNFS.exists(dayPath);
      if (!dayExists) {
        await RNFS.mkdir(dayPath);
      }
      
      return dayPath; // Return the path of the day directory eg: /radscope/spectrum/2025/05/06
    } catch (error) {
      console.error('Error creating date-based directory:', error);
      throw error;
    }
  }
};


const saveDoserateToExternal = useCallback(async (doserate: number, cps: number, createdAt: number) => {
  
  if (!isExternalStorageAvailable) {
    return;
  }
  try {
    const date = new Date(createdAt);
    const dirPath = await createDateBasedDirectory(date, 'doserate');
    const fileName = 'doserate.jsonl';
    const filePath = `${dirPath}/${fileName}`;

    // Convert UTC to IST (UTC+5:30)
    const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);
    
    // Format timestamp string in required format: YYYY-MM-DD HH:mm:ss in IST
    const timeStr = istDate.toISOString()
      .replace('T', ' ')    // Replace T with space
      .slice(0, 19);       // Take only YYYY-MM-DD HH:mm:ss part
    
    // Create data object in exact required format
    const doserateData = {
      [timeStr]: {
        doseRate: Number(doserate.toFixed(3)), // Format to 3 decimal places
        time_stamp: timeStr
      }
    };
    console.log("IST timestamp", timeStr); 
    // Convert to JSON string with newline for JSONL format
    const jsonString = JSON.stringify(doserateData) + '\n';

    try {
      const fileExists = await RNFS.exists(filePath);
      if (fileExists) {
        await RNFS.appendFile(filePath, jsonString, 'utf8');
      } else {
        await RNFS.writeFile(filePath, jsonString, 'utf8');
      }
    } catch (fileError) {
      console.error('Error writing to file:', fileError);
      throw fileError;
    }

  } catch (error) {
    console.error('Error in saveDoserateToExternal:', error);
    // throw error;
  }
}, [createDateBasedDirectory]);

// Add effect to save data when doserate changes
useEffect(() => {
  if (doseRate && timestamp) {
    saveDoserateToExternal(doseRate, cps, timestamp);
  }
}, [doseRate, cps, timestamp, saveDoserateToExternal]);


  // Process messages in batches to reduce render cycles
  const processMessageQueue = useCallback(async () => {
    if (processingRef.current || messageQueueRef.current.length === 0) {
      return;
    }
    
    processingRef.current = true;
    
    try {
      // Get the latest message for processing
      const latestMessage = messageQueueRef.current[0];
      
      // Update messages state (only keep last 50 to prevent memory issues)
      setMessages(prev => [latestMessage, ...prev].slice(0, 50));
      setMessage(latestMessage);
      
      // Process the latest message data
      const data = extractSensorData(latestMessage.payload.toString());
      const newTimestamp = new Date(data.timestamp).getTime();
      
      // Batch state updates
      setSensorData({
        doseRate: data.doseRate,
        cps: data.cps,
        timestamp: newTimestamp,
        gps: data.gps,
        batteryInfo: data.batteryInfo,
        spectrum: data.spectrum
      });
      
      // Update graph array with the new values (keep only last 10)
      setDoseRateGraphArray(prev => 
        [...prev, { doseRate: data.doseRate, timestamp: newTimestamp, cps: data.cps }].slice(-10)
      );
      
      // Save data to database outside of render cycle
      // Uncomment if needed
      // await saveDoserate(data.doseRate, data.cps, newTimestamp);
      
      // Clear processed messages
      messageQueueRef.current = messageQueueRef.current.slice(1);
    } finally {
      processingRef.current = false;
      
      // Process next batch if there are more messages
      if (messageQueueRef.current.length > 0) {
        processMessageQueue();
      }
    }
  }, [extractSensorData, saveDoserate]);

  // Connect to MQTT broker
  const connectMqtt = useCallback(async (mqtt_host: string, mqtt_port: number, deviceId: any) => {
    try {
      if (__DEV__) {
        console.log("Connecting to MQTT broker:", mqtt_host, mqtt_port, deviceId);
      }
      
      const CLIENT_ID = `mqtt-client-${Math.random().toString(16).substr(2, 8)}`;
      
      // Use the provided port or fallback to WebSocket port 8083
      const client = mqtt.connect(`ws://${mqtt_host}:8083`, {
        clientId: CLIENT_ID,
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
        keepalive: 60,
        rejectUnauthorized: false
      });
      
      if (__DEV__) {
        console.log("MQTT port:", mqtt_port);
      }
    
      client.on('connect', () => {
        if (__DEV__) {
          console.log(`Connected to MQTT broker ${mqtt_host}`);
        }
        
        // Subscribe to both the device-specific topic and Demo_Topic
        const TOPIC = `device/GS200/spectrum/+`;
        
        // Subscribe to device-specific topic
        client.subscribe(TOPIC, (err) => {
          if (err) {
            console.error('Subscription error for device topic:', err);
          } else if (__DEV__) {
            console.log('Successfully subscribed to device topic:', TOPIC);
          }
        });
        
        // Also subscribe to Demo_Topic used by Python script
        client.subscribe('Demo_Topic', (err) => {
          if (err) {
            console.error('Subscription error for Demo_Topic:', err);
            setStatus({ 
              connected: false, 
              error: 'Failed to subscribe to Demo_Topic' 
            });
          } else {
            if (__DEV__) {
              console.log('Successfully subscribed to Demo_Topic');
            }
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
        
        // Add message to queue instead of directly updating state
        messageQueueRef.current = [message, ...messageQueueRef.current];
        
        // Process the queue
        processMessageQueue();
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
        setStatus({ 
          connected: false, 
          error: err instanceof Error ? err.message : 'Connection error' 
        });
      });

      client.on('offline', () => {
        if (__DEV__) {
          console.log('MQTT client offline');
        }
        setStatus({ connected: false });
      });

      client.on('reconnect', () => {
        if (__DEV__) {
          console.log('Reconnecting to MQTT broker...');
        }
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
  }, [processMessageQueue]);

  const disconnectMqtt = useCallback(() => {
    if (__DEV__) {
      console.log("Disconnecting from MQTT broker");
    }
    
    if (clientRef.current) {
      clientRef.current.end(true, () => {
        if (__DEV__) {
          console.log('MQTT connection closed');
        }
      });
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({
    message,
    messages,
    status,
    doseRate,
    cps,
    doseRateGraphArray,
    gps,
    timestamp,
    batteryInfo,
    spectrum,
    connectMqtt,
    disconnectMqtt,
    createDateBasedDirectory,
    isExternalStorageAvailable
  }), [
    message, 
    messages, 
    status, 
    doseRate, 
    cps, 
    doseRateGraphArray, 
    gps, 
    timestamp, 
    batteryInfo, 
    spectrum, 
    connectMqtt, 
    disconnectMqtt,
    createDateBasedDirectory,
    isExternalStorageAvailable
  ]);
  
  return (
    <MqttContext.Provider value={contextValue}>
      {children}
    </MqttContext.Provider>
  );
};