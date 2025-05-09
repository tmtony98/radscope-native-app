import { View, Text , StyleSheet } from 'react-native'
import React from 'react'
import DeviceScanner from '@/components/Device/DeviceScanner'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import AddDevice from '@/components/Device/AddDevice';
import ConnectTab from '@/components/Device/ConnectTab';

export default function connect() {
  return (


  
<>   
  <View style={styles.container}>
  <Text style={styles.title} >Add Device </Text>
  <Text style={styles.subtitle} >Scan and connect devices on your network </Text> 

  </View>
  <View style={styles.connectTabContainer}>
   <ConnectTab />
   </View>
     </>

  )
}

 const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
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
