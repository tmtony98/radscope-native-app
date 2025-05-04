import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { useMqttContext } from '../../Provider/MqttContext';
import database from '@/index.native';
import { withObservables } from '@nozbe/watermelondb/react';
import Doserate from '@/model/Doserate';
import { Q } from '@nozbe/watermelondb';

type DoseRateCardProps = {
  latestDoserate?: Doserate[] | null;
};

const DoseRateCard: React.FC<DoseRateCardProps> = ({ latestDoserate }) => {
  const { status,  doseRateGraphArray } = useMqttContext();
  // console.log("doseRateGraphArray", doseRateGraphArray);

  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    const fetchRows = async () => {
      const allRows = await database.get('doserate').query(Q.sortBy('createdAt', Q.desc)).fetch();
      // console.log('allRows', allRows);
    };
    fetchRows();
  }, []);
  

//get the latest doserate from doseRateGraphArray 

  const latestDoseRate = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].doseRate : 0;
  const latestCps = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].cps : 0;
  // const xyz = database.get('doserate').query(Q.sortBy('doserate', Q.desc)).fetch();
  // console.log("xyz", xyz);
 

  // Use the most recent doserate from DB, or fallback to context value
  // const doseValue =
  //   latestDoserate && latestDoserate.length > 0
  //     ? latestDoserate[0].doserate
  //     : doseRate;

  return (
    <View style={CARD_STYLE.container}>
      <Text style={TYPOGRAPHY.headLineSmall}>Dose Rate</Text>
      <View style={styles.doseRateContainer}>
        <View style={styles.doseRate}>
          <Text style={styles.doseValue}>{latestDoseRate}</Text>
          <Text style={styles.doseUnit}>uSv/h</Text>
        </View>
        <View style={styles.cpsContainer}>
          <Text>cps value</Text>
          <Text>{latestCps}</Text>
        </View>
      </View>
      <View style={styles.mqttStatus}>
        <Text style={TYPOGRAPHY.bodyTextMedium}>MQTT Connection</Text>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: status.connected ? COLORS.success : COLORS.error },
          ]}
        >
          <Text style={styles.statusText}>{status.connected ? 'ON' : 'OFF'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  doseRate: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: SPACING.sm,
  },
  doseRateContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cpsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  doseValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    lineHeight: 48,
    color: COLORS.primary,
  },
  doseUnit: {
    ...TYPOGRAPHY.bodyTextLarge,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  mqttStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -5,
  },
  statusIndicator: {
    marginLeft: SPACING.xs,
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

export default DoseRateCard;