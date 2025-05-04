import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import DeviceScanner from '@/components/Device/DeviceScanner'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { TYPOGRAPHY, COLORS } from '@/Themes/theme'

import AddDevice from '@/components/Device/AddDevice';
import ConnectTab from '@/components/Device/TopbarConnectTab';
import Header from '@/components/Header';

export default function ConnectPage() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Radscope App" />
      <View style={styles.container}>
        <Text style={styles.title}>Add Device</Text>
        <Text style={styles.subtitle}>Scan and connect devices on your network</Text>
      </View>
      <View style={styles.connectTabContainer}>
        <ConnectTab />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0E1725',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#0E1725',
  },
  connectTabContainer: {
    flex: 5,
  },
})  
