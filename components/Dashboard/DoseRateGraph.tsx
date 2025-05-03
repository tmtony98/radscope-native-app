import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMqttContext } from '@/Provider/MqttContext';
import { LineChart } from 'react-native-chart-kit';
import { CartesianChart,useChartPressState , Line } from "victory-native"
import { useFont } from "@shopify/react-native-skia";
import inter from "../../assets/fonts/Inter/static/Inter_18pt-Bold.ttf"
import { format } from "date-fns"; //



type ChartCardProps = {
  // onFullscreen?: () => void;
  onGetHistory?: () => void;
};

export default function DoseRateGraph({ onGetHistory }: ChartCardProps) {
  const { doseRateGraphArray } = useMqttContext();
  const router = useRouter();

  const font = useFont(inter, 12);

  const getLastTimestamp = () => {
    const timestamp = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].timestamp : 0;
    return timestamp ? format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss') : 'No data';
  };

 


  const DATA = Array.from({ length: 31 }, (_, i) => ({
    timestamp: i, // This would be actual timestamps in a real app
    doseRate: 0.5 + 2 * Math.random(), // Random values between 0.5 and 2.5 µSv
  }));

  const handleGetHistory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to the dose history page
    router.push('/dose-history');
    // Also call the provided callback if needed
    // onGetHistory();
  };

 

  const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });

  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>Dose Rate</Text>
        <View style={styles.headerActions}>
          <Text style={TYPOGRAPHY.smallText}>{getLastTimestamp()}</Text>
          {/* <TouchableOpacity style={styles.iconButton} onPress={handleFullscreen}>
            <MaterialIcons name="fullscreen" size={24} color={COLORS.primary} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* <View style={{ height: 300 }}>
      <CartesianChart
       chartPressState={state}
        data={doseRateGraphArray}
        xKey="timestamp"
        yKeys={["doseRate"]}
        // 👇 pass the font, opting in to axes.
        // axisOptions={{ font }}
      >
        {({ points }) => (
          <Line points={points.doseRate} color="red" strokeWidth={3} />
        )}
      </CartesianChart>
    </View> */}
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={doseRateGraphArray}
        xKey="timestamp"
        yKeys={["doseRate"]}
        
        //add font
        axisOptions={{ 
          font,
          lineWidth: 1,
          lineColor: "#CCCCCC",
          labelColor: "#333333",
        }}
       
       
        xAxis={
          {
            formatXLabel: (label: number) => new Date(label).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            font,
            labelRotate: 45, 
          }
        }
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="blue" 
            strokeWidth={2}
            curveType="natural" // Smooths the line
          />
        )}
      </CartesianChart>
    </View>

     
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={BUTTON_STYLE.mediumButtonWithIconLeft} onPress={handleGetHistory}>
          <MaterialIcons name="history" size={24} color={COLORS.white} />
          <Text style={styles.buttonText}>Get History Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWithActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  chartPlaceholder: {
    height: 250,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: COLORS.border,
    // borderStyle: 'solid',
  },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    width: 205
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});
