import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Device } from "../Types";

// Define the context type
type DeviceContextType = {
  connectedDevice: Device | null;
  connectDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  isConnecting: boolean;

  // Add a callback for when device connection changes
  onDeviceConnectionChange?: (device: Device | null) => void;
  setConnectionCallback: (callback: (device: Device | null) => void) => void;
};

// Create context with default values
const DeviceContext = createContext<DeviceContextType>({
  connectedDevice: null,
  connectDevice: async () => { },
  disconnectDevice: async () => { },
  isConnecting: false,
  setConnectionCallback: () => { },
});

// Storage key for the connected device
const DEVICE_STORAGE_KEY = "connectedDevice";

//Hook to use the device context
export const useDeviceContext = () => useContext(DeviceContext);

// Provider component
export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionCallback, setConnectionCallback] = useState<
    ((device: Device | null) => void) | undefined
  >(undefined);

  // Load any previously connected device on mount
  useEffect(() => {
    const loadConnectedDevice = async () => {
      try {
        const savedDevice = await SecureStore.getItemAsync(DEVICE_STORAGE_KEY);
        console.log("Saved device:", savedDevice);

        if (savedDevice) {
          setConnectedDevice(JSON.parse(savedDevice));
        }
      } catch (error) {
        console.error("Failed to load connected device:", error);
      }
    };

    loadConnectedDevice();
  }, []);

  // Connect a device
  const connectDevice = useCallback(
    async (device: Device) => {
      console.log("connectDevice called");
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

        // Call the connection callback if it exists
        if (connectionCallback) {
          console.log(
            "Calling connection callback with device:",
            connectedDeviceData
          );
          connectionCallback(connectedDeviceData);
        }
      } catch (error) {
        console.error("Failed to connect device:", error);
      } finally {
        setIsConnecting(false);
      }
    },
    [connectionCallback]
  );

  // Disconnect the current device
  const disconnectDevice = useCallback(async () => {
    try {
      // Remove from secure storage
      await SecureStore.deleteItemAsync(DEVICE_STORAGE_KEY);

      // Update state
      setConnectedDevice(null);

      // Call the connection callback if it exists
      if (connectionCallback) {
        console.log("Calling connection callback with null device");
        connectionCallback(null);
      }
    } catch (error) {
      console.error("Failed to disconnect device:", error);
    }
  }, [connectionCallback]);

  // Set connection callback function
  const setCallback = useCallback(
    (callback: (device: Device | null) => void) => {
      console.log("Setting connection callback");
      setConnectionCallback(() => callback);
    },
    []
  );

  return (
    <DeviceContext.Provider
      value={{
        connectedDevice,
        connectDevice,
        disconnectDevice,
        isConnecting,
        onDeviceConnectionChange: connectionCallback,
        setConnectionCallback: setCallback,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};
