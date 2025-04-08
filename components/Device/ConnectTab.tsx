import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import DeviceScanner from '@/components/Device/DeviceScanner'; 
import AddDevice from '@/components/Device/AddDevice';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export default function ConnectTab() {
  return (
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
        component={DeviceScanner}
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
        component={AddDevice}
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
  );
}
