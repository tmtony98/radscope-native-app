import { View, StyleSheet, Text , FlatList, SafeAreaView } from "react-native";
import App from "@/App";
import { useMqttContext } from "@/Provider/MqttContext";
import { useEffect, useState } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";
import Header from "@/components/Header";


export default function Index( route: any  | null) {
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Dashboard" />
     <Dashboard />
    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
   width: '100%',
   backgroundColor: '#ffffff',
  },
});
