import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useMqttContext } from '@/Provider/MqttContext';

export default function GPSCard() {
  const { gps } = useMqttContext();
  

  console.log("GPS Data:", gps);

  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>GPS</Text>
        {gps?.Fix === 1 ? (
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="gps-fixed" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="gps-off" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinateColumn}>
          <Text style={TYPOGRAPHY.TitleLarge}>Latitude</Text>
          <Text style={TYPOGRAPHY.bodyTextLarge}>{gps?.Lat || "-"}</Text>
        </View>
        <View style={styles.coordinateColumn}>
          <Text style={TYPOGRAPHY.TitleLarge}>Longitude</Text>
          <Text style={TYPOGRAPHY.bodyTextLarge}>{gps?.Lon || "-"}</Text>
        </View>
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
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  coordinateColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});
