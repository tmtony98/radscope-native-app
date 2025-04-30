import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import DeviceScanner from '@/components/Device/DeviceScanner'; 
import AddDevice from '@/components/Device/AddDevice';
import { MaterialIcons } from '@expo/vector-icons';
import ConnectedDeviceCard from './ConnectedDeviceCard';
import { COLORS, SPACING } from '../../Themes/theme';
import { Device } from '@/Types';
import { useDeviceContext } from '@/Provider/DeviceContextProvider';

const Tab = createMaterialTopTabNavigator();

// Prop types for our components
export interface DeviceScannerProps {
  connectDevice: (device: Device) => Promise<void>;
  isConnecting: boolean;
}

export interface AddDeviceProps {
  connectDevice: (device: Device) => Promise<void>;
  isConnecting: boolean;
}

// Export the Device interface for other components

const ConnectTab = () => {
  const { connectedDevice, connectDevice, disconnectDevice, isConnecting } = useDeviceContext();

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
      {connectedDevice && <ConnectedDeviceCard />}
      
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

export default ConnectTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
