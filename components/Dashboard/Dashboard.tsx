import { View, Text, ScrollView , StyleSheet } from 'react-native'
import React from 'react'
import DoseRateCard from './DoseRateCard'   
import DeviceDetailsCard from './DeviceDetailsCard'
import DoseRateGraph from './DoseRateGraph'
import SpectrumCard from './SpectrumCard'
import GPSCard from './GPSCard'
import SessionLoggingCard from './SessionLoggingCard'
import BatteryCard from './BatteryCard'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
});
const handleFullscreen = () => {
    console.log('Fullscreen pressed');
  };

  const handleGetHistory = () => {
    console.log('Get history pressed');
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  const handleGetLocation = () => {
    console.log('Get location pressed');
  };

  const handleDownload = () => {
    console.log('Download files pressed');
  };

  const handleStart = () => {
    console.log('Start logging pressed');
  };

export default function Dashboard() {
  return (
    <View style={{ flex: 1, width: '100%' }}>
      <ScrollView style={styles.container}>
      
      <DeviceDetailsCard />

      <DoseRateCard 
        doseRate={0.589} 
        unit="μSv/h" 
        mqttStatus={true} 
      />

      <DoseRateGraph 
        title="Dose Rate"
        timestamp="11:15:25 AM"
        onFullscreen={handleFullscreen}
        onGetHistory={handleGetHistory}
      />

      <SpectrumCard 
        duration="222 s"
        onFullscreen={handleFullscreen}
      />

      <GPSCard 
        latitude="18.6545556"
        longitude="18.6545556"
        onGetLocation={handleGetLocation}
      />

      <SessionLoggingCard 
        onDownload={handleDownload}
        onStart={handleStart}
      />

      <BatteryCard 
        chargeRemaining="50%"
        batteryVoltage="3.514 V"
        chargingStatus="Not Charging"
        isLastCard={true}
      />
    </ScrollView>

    </View>
  )
}