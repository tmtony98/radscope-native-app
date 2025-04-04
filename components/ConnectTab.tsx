import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import MDNSDeviceScanner from '@/components/MDNSDeviceScanner';
import AddDevice from '@/components/AddDevice';


const Tab = createMaterialTopTabNavigator();

export default function ConnectTab() {
  return (
    
    <Tab.Navigator>
      <Tab.Screen name="Scan Devices" component={MDNSDeviceScanner} />
      <Tab.Screen name="Add Device" component={AddDevice} />
    </Tab.Navigator>
  );
}
