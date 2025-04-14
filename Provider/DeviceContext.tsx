import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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
  connectDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  isConnecting: boolean;
};

// Create context with default values
const DeviceContext = createContext<DeviceContextType>({
  connectedDevice: null,
  connectDevice: async () => {},
  disconnectDevice: async () => {},
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

  // Connect a device
  const connectDevice = async (device: Device) => {
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

  // Disconnect the current device
  const disconnectDevice = async () => {
    try {
      // Remove from secure storage
      await SecureStore.deleteItemAsync(DEVICE_STORAGE_KEY);
      
      // Update state
      setConnectedDevice(null);
    } catch (error) {
      console.error('Failed to disconnect device:', error);
    }
  };

  return (
    <DeviceContext.Provider
      value={{
        connectedDevice,
        connectDevice,
        disconnectDevice,
        isConnecting,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}; 