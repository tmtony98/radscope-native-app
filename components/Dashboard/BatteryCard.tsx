import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { useMqttContext } from '@/Provider/MqttContext';


type BatteryCardProps = {

  isLastCard?: boolean;
};

export default function BatteryCard({

 
  isLastCard = false,
}: BatteryCardProps) {

  const { batteryInfo } = useMqttContext();
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  // console.log("=======batteryInfo====", batteryInfo, "=======  currentTime", now);
  


  return (
    <View style={[CARD_STYLE.container, isLastCard && styles.lastCard]}>
      <Text style={TYPOGRAPHY.headLineMedium}>Battery</Text>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charge Remaining</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.SOC} %</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Battery Voltage</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.Voltage}V</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charging Status</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.StatusCharging ? "Charging" : "Not Charging"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charging  Voltage</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.VoltageBUS} mV</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Charging Current</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.ChargingCurrent}mA</Text>
      </View>
      <View style={styles.row}>
        <Text style={TYPOGRAPHY.bodyTextLarge}>Battery Temperature</Text>
        <Text style={TYPOGRAPHY.bodyTextMedium}>{batteryInfo?.Temperature} c</Text>
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
