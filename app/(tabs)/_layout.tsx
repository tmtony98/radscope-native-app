import React from 'react'
import { Tabs } from 'expo-router'
import { MapPin, Settings ,Home, Plus } from 'lucide-react-native'
import { useColorScheme } from 'react-native'
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme()
  
  return (
    <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#31435E',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        height: 70,
        paddingHorizontal: 10,
        paddingTop: 4
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 0,
      },
    }}>
    
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ size, color }) => (
          <Home size={28} color={color} />
        ),
        
          
      }}

    />
        <Tabs.Screen
      name="connectPage"
      options={{
        title: '',
        tabBarIcon: ({ color, size }) => {
          const [focused, setFocused] = React.useState(false);

          useFocusEffect(() => {
            setFocused(true);
            return () => setFocused(false);
          });

          return (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Plus
                size={35} // Larger icon size
                color={focused ? '#FFFFFF' : '#ffffff'} // Change icon color based on focus
              />
            </View>
          );
        },
      }}
      />
    <Tabs.Screen
      name="settings"
      options={{
        title: 'Settings',
        tabBarIcon: ({ size, color }) => (
          <Settings size={28} color={color} />
        ),
      }}
      />
    </Tabs>
    
    
  )
}
const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 100,
   marginBottom:-25,
    backgroundColor: '#31435E', // Default background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#31435E', // Background color when active
  },
});