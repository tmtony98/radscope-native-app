import React, { createContext, useContext, useState, useEffect , useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useMqttContext } from '@/Provider/MqttContext';
import { AppState } from 'react-native';


// Define the Device type
export type Device = {
  name: string;
  host: string;
  port?: number;
  type?: string;
  isConnected: boolean;
};

// Define the context type
type DeviceContextType = {
  connectedDevice: Device | null;
  setDeviceInStore: (device: Device) => Promise<void>;
  resetDeviceInStore: () => Promise<void>;
  isConnecting: boolean;
};


// Create context with default values
const DeviceContext = createContext<DeviceContextType>({
  connectedDevice: null,
  setDeviceInStore: async () => {},
  resetDeviceInStore: async () => {},
  isConnecting: false,
});

// Storage key for the connected device
const DEVICE_STORAGE_KEY = 'connectedDevice';

// Hook to use the device context
export const useDeviceContext = () => useContext(DeviceContext);

// Provider component
export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const { connectMqtt , disconnectMqtt , status  } = useMqttContext();

   const appState = useRef(AppState.currentState);
    // console.log("Current app state:", appState.current);
    //create a state to know background or foreground
    const [isBackground, setIsBackground] = useState(true);
    
  // Load any previously connected device on mount
  useEffect(() => {
    const loadConnectedDevice = async () => {
      try {
        const savedDevice = await SecureStore.getItemAsync(DEVICE_STORAGE_KEY);
        if (savedDevice) {
          setConnectedDevice(JSON.parse(savedDevice));
        }
      } catch (error) {
        console.error('Failed to load connected device:', error);
      }
    };

    loadConnectedDevice();
  }, []);

  // Set a device
  const setDeviceInStore = async (device: Device) => {
    try {
      setIsConnecting(true);
      // Set the device as connected
      const connectedDeviceData = { ...device, isConnected: true };
      
      // Save to secure storage
      await SecureStore.setItemAsync(
        DEVICE_STORAGE_KEY,
        JSON.stringify(connectedDeviceData)
      );
      
      // Update state
      setConnectedDevice(connectedDeviceData);
    } catch (error) {
      console.error('Failed to connect device:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Reset the current device
  const resetDeviceInStore = async () => {
    try {
      // Remove from secure storage
      await SecureStore.deleteItemAsync(DEVICE_STORAGE_KEY);
      
      // Update state
      setConnectedDevice(null);
    } catch (error) {
      console.error('Failed to disconnect device:', error);
    }
  };

const reconnectMQTT = (device: Device) => {
      disconnectMqtt();
      console.log("disconnecting and connecting to MQTT broker:", device.host, device.port, device.name);
      // Use port 8883 for WebSocket connection if the device port is 1883 (standard MQTT)
      const wsPort = device.port === 1883 ? 8883 : (device.port || 8883); //8083 -recheck
      console.log("WebSocket port at devicecontext:", wsPort);
           
      //Pass the device object to connectMqtt to handle both device ID and Demo_Topic
      connectMqtt(device.host, wsPort, device);
  }





  useEffect(() => {
    const autoConnectDevice = async () => {
      try {
        // Check if we have a connected device in the context
        if (connectedDevice && !status.connected) {
          console.log("Auto-connecting to previously connected device:", connectedDevice.name);
          // Reconnect to MQTT broker
          reconnectMQTT(connectedDevice);
        }
      } catch (error) {
        console.error('Failed to auto-connect device:', error);
      }
    };

    autoConnectDevice();
  }, [connectedDevice]);

  // Add AppState listener to reconnect when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      appState.current = nextAppState;
      // console.log("Current app state:", appState.current);

      if (nextAppState === "active" && connectedDevice && !status.connected) {
        console.log("App came to foreground, reconnecting to device:", connectedDevice.name);
        reconnectMQTT(connectedDevice);
        setIsBackground(false);
      } else if (nextAppState === "background") {
        setIsBackground(true);
        console.log("App has gone to background");
      }
    });

    return () => {
      subscription.remove();
    };
  }, [connectedDevice, status.connected]);

















  return (
    <DeviceContext.Provider
      value={{
        connectedDevice,
        setDeviceInStore,
        resetDeviceInStore,
        isConnecting,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}; 