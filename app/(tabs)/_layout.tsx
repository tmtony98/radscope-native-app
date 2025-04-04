import React from 'react'
import { Tabs } from 'expo-router'
import { MapPin, Settings ,Home, Plus } from 'lucide-react-native'
import { useColorScheme } from 'react-native'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  
  return (
    <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#007AFF',
    }}>
    
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ size, color }) => (
          <Home size={size} color={color} />
        ),
      }}
    />
        <Tabs.Screen
      name="connectPage"
      options={{
        title: 'Devices',
        tabBarIcon: ({ size, color }) => (
          <Plus size={size} color={color} />
        ),
      }}
      />
    <Tabs.Screen
      name="settings"
      options={{
        title: 'Settings',
        tabBarIcon: ({ size, color }) => (
          <Settings size={size} color={color} />
        ),
      }}
      />
    </Tabs>
    
    
  )
}