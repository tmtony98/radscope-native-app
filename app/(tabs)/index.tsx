import { View, StyleSheet, Text , FlatList } from "react-native";
import App from "@/App";
import { useMqttContext } from "@/Provider/MqttContext";
import { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";

export default function Index( route: any  | null) {
  const { doseRate } = useMqttContext();

  
  return (
    <View style={styles.container}>
     <Dashboard />
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
   backgroundColor: '#fff',
   width: '100%',
  //  paddingHorizontal: 16,
  },
});
