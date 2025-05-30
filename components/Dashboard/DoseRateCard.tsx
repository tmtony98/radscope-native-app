import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect , useState , useRef} from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { useMqttContext } from '../../Provider/MqttContext';
import database from '@/index.native';
import { withObservables } from '@nozbe/watermelondb/react';
import Doserate from '@/model/Doserate';
import { Q } from '@nozbe/watermelondb';
import { useSettingsContext } from '../../Provider/SettingsContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type DoseRateCardProps = {
  latestDoserate?: Doserate[] | null;
};

const DoseRateCard: React.FC<DoseRateCardProps> = ({ latestDoserate }) => {
  const { status, doseRateGraphArray } = useMqttContext();
  const { generalSettings } = useSettingsContext();
  // console.log("doseRateGraphArray", doseRateGraphArray);
  console.log("generalSettings", generalSettings);
  const [thresholdExceeded, setThresholdExceeded] = useState(false);
  const tresholdRef = useRef<boolean>(false);
  const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    const fetchRows = async () => {
      const allRows = await database.get('doserate').query(Q.sortBy('createdAt', Q.desc)).fetch();
      // console.log('allRows', allRows);
    };
    fetchRows();
  }, []);

  
  const latestDoseRate = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].doseRate : 0;
  const latestCps = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].cps : 0;


  useEffect(() => {
    if (generalSettings && generalSettings.alarm !== null) {
      const alarmThreshold = generalSettings.alarm;
      if (latestDoseRate > alarmThreshold) {
      
       tresholdRef.current = true;
      //  debugger
       console.log("thresholdRef", tresholdRef.current);
       
      } else {
        console.log("thresholdRef", tresholdRef.current);
        tresholdRef.current = false
      }
    }
    console.log("thresholdRef", tresholdRef.current);

  }, [latestDoseRate, generalSettings]);


  //get the latest doserate from doseRateGraphArray 

  // const xyz = database.get('doserate').query(Q.sortBy('doserate', Q.desc)).fetch();
  // console.log("xyz", xyz);

  // Use the most recent doserate from DB, or fallback to context value
  // const doseValue =
  //   latestDoserate && latestDoserate.length > 0
  //     ? latestDoserate[0].doserate
  //     : doseRate;

  return (
    <View style={CARD_STYLE.container}>
      <View style={ styles.headingContainer}> 
      <Text style={TYPOGRAPHY.headLineMedium}>Dose Rate</Text>
         
         { tresholdRef.current &&
           <View style={styles.loggingIndicatorContainer}>
           <Text style={styles.loggingText}>Threshold Value Exceeded</Text>
         </View>
         }
    
      </View>
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
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  loggingIndicatorContainer: {
    // flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: -5,
  },
  loggingText: {
    fontSize: 12,
    color: COLORS.error,
    fontFamily: "Poppins-Medium",
  },
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
  container: {
    flex: 1,
  },
  listContentContainer: {
    flexGrow: 1,
  },
});

export default DoseRateCard;