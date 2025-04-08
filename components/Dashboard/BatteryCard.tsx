import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';

type BatteryCardProps = {
  chargeRemaining?: string;
  batteryVoltage?: string;
  chargingStatus?: string;
  isLastCard?: boolean;
};

export default function BatteryCard({
  chargeRemaining = '50%',
  batteryVoltage = '3.514 V',
  chargingStatus = 'Not Charging',
  isLastCard = false,
}: BatteryCardProps) {
  return (
    <View style={[CARD_STYLE.container, isLastCard && styles.lastCard]}>
      <Text style={TYPOGRAPHY.headLineSmall}>Battery</Text>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charge Remaining</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{chargeRemaining}</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Battery Voltage</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryVoltage}</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charging Status</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{chargingStatus}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  lastCard: {
    marginBottom: 80, // Extra margin for tab bar
  },
});
