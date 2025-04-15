import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import DeviceScanner from '@/components/Device/DeviceScanner'; 
import AddDevice from '@/components/Device/AddDevice';
import { MaterialIcons } from '@expo/vector-icons';
import ConnectedDeviceCard from './ConnectedDeviceCard';
import { COLORS, SPACING } from '../../Themes/theme';
import * as SecureStore from 'expo-secure-store';

const Tab = createMaterialTopTabNavigator();

// Define Device type
export type Device = {
  name: string;
  host: string;
  port?: number;
  type?: string;
  isConnected: boolean;
};

// Prop types for our components
export interface DeviceScannerProps {
  connectDevice: (device: Device) => Promise<void>;
  isConnecting: boolean;
}

export interface AddDeviceProps {
  connectDevice: (device: Device) => Promise<void>;
  isConnecting: boolean;
}

// Storage key for the connected device
const DEVICE_STORAGE_KEY = 'connectedDevice';

export default function ConnectTab() {
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

  // Create a custom component wrapper that passes props
  const ScanDevicesWithProps = (props: any) => (
    <DeviceScanner 
      {...props} 
      connectDevice={connectDevice} 
      isConnecting={isConnecting} 
    />
  );

  // Create a custom component wrapper that passes props
  const AddDeviceWithProps = (props: any) => (
    <AddDevice 
      {...props} 
      connectDevice={connectDevice} 
      isConnecting={isConnecting} 
    />
  );

  return (
    <View style={styles.container}>
      {/* Connected Device Card */}
      {connectedDevice && (
        <ConnectedDeviceCard 
          connectedDevice={connectedDevice} 
          disconnectDevice={disconnectDevice} 
        />
      )}
      
      {/* Tab Navigator */}
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0E1725',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarIndicatorStyle: {
            backgroundColor: '#0E1725',
            height: 3,
            width: '30%',
            marginHorizontal: '10%',
            paddingHorizontal: 10,
            alignSelf: 'center',
            borderRadius: 2,
          },
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: '700',
          },
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            width: '90%', 
            alignSelf: 'center',
            borderRadius: 10,
            height: 75,
          },
        }}>
        <Tab.Screen
          name="Scan Devices"
          component={ScanDevicesWithProps}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <MaterialIcons
                name="search"
                size={24}
                color={focused ? '#0E1725' : '#8E8E93'}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Add Device"
          component={AddDeviceWithProps}
          options={{
            tabBarIcon: ({ focused, color }) => (
              <MaterialIcons
                name="add-circle-outline"
                size={24}
                color={focused ? '#0E1725' : '#8E8E93'}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
