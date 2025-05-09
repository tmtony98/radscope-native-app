import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { MqttProvider } from '../Provider/MqttContext';
import { DeviceProvider } from '../Provider/DeviceContext';
import { SettingsProvider } from '../Provider/SettingsContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!fontsLoaded) {
      SplashScreen.preventAutoHideAsync();
    } else {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
    <MqttProvider>
      <DeviceProvider>
        <GestureHandlerRootView style={{ flex: 1 }}> 
          <View style={{ flex: 1 }}>
            <StatusBar
              style={colorScheme === 'dark' ? 'light' : 'dark'}
              backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
            />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="spectrum-settings" options={{ headerShown: false }} />
              <Stack.Screen name="dose-history" options={{ headerShown: false }} />
              <Stack.Screen name="dose-history-view" options={{ headerShown: false }} />
              <Stack.Screen name="SessionView" options={{ headerShown: true }} />
              <Stack.Screen name="SessionDatas" options={{ headerShown: true }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
        </GestureHandlerRootView>
      </DeviceProvider>
    </MqttProvider>
    </SettingsProvider>
  );
}


