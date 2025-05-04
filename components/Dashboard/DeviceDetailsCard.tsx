import { View, Text ,StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CARD_STYLE, COLORS, SPACING ,  TYPOGRAPHY } from '../../Themes/theme';
import { useMqttContext } from '@/Provider/MqttContext';
import { Device, useDeviceContext } from '@/Provider/DeviceContext';

export default function DeviceDetailsCard() {
  const { status } = useMqttContext();
  const { connectedDevice } = useDeviceContext();
  const [deviceDetails, setDeviceDetails] = useState<Device | null>(null);
  // secure store context

  useEffect(() => {
    // get device details from secure store
    setDeviceDetails(connectedDevice);
  }, [status]);


  return (
    <View style={CARD_STYLE.container}>
    <Text style={[TYPOGRAPHY.headLineSmall, {marginBottom: 12}]}>Device Details</Text>
    <View style={styles.row}>
      <Text style={TYPOGRAPHY.TitleMedium}>Device ID</Text>
      <Text style={TYPOGRAPHY.bodyTextLarge}>{deviceDetails?.name}</Text>
    </View>
    <View style={styles.row}>
      <Text style={TYPOGRAPHY.TitleMedium}>Device IP Address</Text>
      <Text style={TYPOGRAPHY.bodyTextLarge}>{deviceDetails?.host}</Text>
    </View>
  </View>
  )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
      }
  
  });