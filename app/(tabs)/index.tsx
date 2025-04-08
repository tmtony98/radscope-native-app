import { View, StyleSheet, Text , FlatList } from "react-native";
import MDNSDeviceScanner from '../../components/MDNSDeviceScanner';
import App from "@/App";
import useMqtt from "@/Hooks/useMqtt";
import { useEffect, useState } from "react";
import Chart from "@/components/Chart";

export default function Index( route: any  | null) {
  const { status, messages , doseRate } = useMqtt();

  console.log("doseRate", doseRate);

  const chartData = [
    {
      timestamp: "2023-01-01",
      value: doseRate
    }
  ]
  
  
 


 

  return (
    <View style={styles.container}>
     <Text>Status: {status.connected ? 'Connected' : 'Disconnected'}</Text>
     <Text>Dose Rate: {doseRate}</Text>
     <Chart data={chartData} />
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
