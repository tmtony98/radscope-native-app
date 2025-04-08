import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';

type GPSCardProps = {
  latitude?: string;
  longitude?: string;
  onGetLocation?: () => void;
};

export default function GPSCard({
  latitude = '18.6545556',
  longitude = '18.6545556',
  onGetLocation = () => {},
}: GPSCardProps) {
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>GPS</Text>
        <TouchableOpacity style={styles.iconButton} onPress={onGetLocation}>
          <MaterialIcons name="my-location" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Latitude</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{latitude}</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Longitude</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{longitude}</Text>
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
