import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqttContext } from '@/Provider/MqttContext';



export default function GPSCard() {
  
  const { gps } = useMqttContext();

  // console.log("gps", gps);
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>GPS</Text>
    
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Latitude</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{gps?.Lat}</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Longitude</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{gps?.Lon}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWithActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
});
