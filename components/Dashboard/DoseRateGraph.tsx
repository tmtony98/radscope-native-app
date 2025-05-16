import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React, { useMemo } from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMqttContext } from '@/Provider/MqttContext';
import { CartesianChart, useChartPressState, Line, Area, useChartTransformState } from "victory-native"
import { useFont } from "@shopify/react-native-skia";
import inter from "../../assets/fonts/Inter/static/Inter_18pt-Bold.ttf"
import { format } from "date-fns";



type ChartCardProps = {
  // onFullscreen?: () => void;
  onGetHistory?: () => void;
};

export default function DoseRateGraph({ onGetHistory }: ChartCardProps) {
  const { doseRateGraphArray } = useMqttContext();
  const router = useRouter();

  const font = useFont(inter, 12);
  
  // Create transform state for optimized rendering and pan/zoom functionality
  const { state: transformState } = useChartTransformState({
    scaleX: 1.0,
    scaleY: 1.0,
  });
  
  // Limit data to the last 10 points
  const limitedData = useMemo(() => {
    if (doseRateGraphArray.length <= 10) return doseRateGraphArray;
    return doseRateGraphArray.slice(-10);
  }, [doseRateGraphArray]);
  
  // Calculate min and max values for better domain scaling
  const yDomain = useMemo(() => {
    if (limitedData.length === 0) return { min: 0, max: 1 };
    
    const values = limitedData.map(point => point.doseRate);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Add significant padding to prevent values from being cut off
    const padding = (max - min) * 0.3;
    return { 
      min: Math.max(0, min - padding), // Don't go below zero
      max: max + padding * 1.5 // Extra padding at the top
    };
  }, [limitedData]);

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

    <View style={{ height: 300, width: '100%', }}>
      <CartesianChart
        data={limitedData}
        xKey="timestamp"
        yKeys={["doseRate"]}
        axisOptions={{ 
          font,
          lineWidth: 1,
          lineColor: "#CCCCCC",
          labelColor: "#333333",
          formatYLabel: (value: number) => value.toFixed(2)
        }}
        domain={{ y: [yDomain.min, yDomain.max] }}
        transformState={transformState}
        transformConfig={{
          pan: { enabled: true, dimensions: ["x"] },
          pinch: { enabled: true, dimensions: ["x"] },
        }}
        xAxis={{
          formatXLabel: (label: number) => {
            const date = new Date(label);
            // 24-hour format, no AM/PM
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
          },
          font,
          labelRotate: 45,
          tickCount: 5,
        }}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.doseRate}
              y0={chartBounds.bottom}
              color="rgba(30, 136, 229, 0.2)"
              curveType="natural"
              opacity={0.6}
            />
            <Line 
              points={points.doseRate} 
              color="#1E88E5" 
              strokeWidth={2.5}
              curveType="natural"
            />
          </>
        )}
      </CartesianChart>
    </View>

    {/* Add the label just below the graph */}
    <Text
      style={{
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 4,
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.2,
      }}
    >
      Dose Rate (uSv/h) vs Time (HH:MM:SS)
    </Text>
     
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
    marginTop: SPACING.lg,
  },
});
