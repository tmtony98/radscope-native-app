import { View, StyleSheet, Text , FlatList } from "react-native";
import MDNSDeviceScanner from '../../components/MDNSDeviceScanner';
import App from "@/App";
import useMqtt from "@/Hooks/useMqtt";
import { useEffect, useState } from "react";

export default function Index( route: any  | null) {
  const { status, messages , doseRate } = useMqtt();

  console.log("doseRate", doseRate);
  
  
 
  function getDoserate(data: any) {
    try {
      if (!data || !data.length) return 0;
      
      // Get the most recent message (first in the array)
      const latestMessage = data[0];
      
      // Parse the payload string to JSON
      const parsedData = JSON.parse(latestMessage.payload);
      
      // Extract the doserate value from the parsed JSON
      if (parsedData?.data?.Sensor?.doserate?.value !== undefined) {
        return parsedData.data.Sensor.doserate.value;
      }
      
      return 0;
    } catch (error) {
      console.error("Error extracting doserate value:", error);
      return 0;
    }
  }

 

  return (
    <View style={styles.container}>
     <Text>Status: {status.connected ? 'Connected' : 'Disconnected'}</Text>
     <Text>Dose Rate: {doseRate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
