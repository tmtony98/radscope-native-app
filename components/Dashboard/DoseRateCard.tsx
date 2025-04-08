import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
 import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';

type DoseRateCardProps = {
  doseRate?: number;
  unit?: string;
  mqttStatus?: boolean;
};

export default function DoseRateCard({ doseRate = 0.589, unit = 'μSv/h', mqttStatus = true }: DoseRateCardProps) {
  return (
    <View style={CARD_STYLE.container}>
      <Text style={TYPOGRAPHY.headLineSmall}>Dose Rate</Text>
      <View style={styles.doseRate}>
        <Text style={styles.doseValue}>{doseRate}</Text>
        <Text style={styles.doseUnit}>{unit}</Text>
      </View>
      <View style={styles.mqttStatus}>
        <Text style={TYPOGRAPHY.bodyTextMedium}>MQTT Connection</Text>
        <View style={[styles.statusIndicator, { backgroundColor: mqttStatus ? COLORS.success : COLORS.error }]}>
          <Text style={styles.statusText}>{mqttStatus ? 'ON' : 'OFF'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  doseRate: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.md,
  },
  doseValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    lineHeight: 51,
    color: COLORS.primary,
  },
  doseUnit: {
    ...TYPOGRAPHY.bodyTextLarge,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  mqttStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    lineHeight: 18,
  },
});