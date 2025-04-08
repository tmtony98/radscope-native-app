import { View, Text ,StyleSheet } from 'react-native'
import React from 'react'
import { CARD_STYLE, COLORS, SPACING ,  TYPOGRAPHY } from '../../Themes/theme';

export default function DeviceDetailsCard() {
  return (
    <View style={CARD_STYLE.container}>
    <Text style={[TYPOGRAPHY.headLineMedium, {marginBottom: 12}]}>Device Details</Text>
    <View style={styles.row}>
      <Text style={TYPOGRAPHY.TitleMedium}>Device ID</Text>
      <Text style={TYPOGRAPHY.bodyTextLarge}>GS200X|3J4LS0DK2LX0</Text>
    </View>
    <View style={styles.row}>
      <Text style={TYPOGRAPHY.TitleMedium}>Device IP Address</Text>
      <Text style={TYPOGRAPHY.bodyTextLarge}>192.168.29.6</Text>
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