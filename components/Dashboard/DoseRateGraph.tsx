import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React, { useMemo } from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMqttContext } from '@/Provider/MqttContext';
import { CartesianChart, useChartPressState, Line, Area, useChartTransformState } from "victory-native"
import { useFont, Circle, Text as SkiaText, Rect } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
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
    if (doseRateGraphArray.length <= 10)
       return doseRateGraphArray;
    return doseRateGraphArray.slice(-15);
  }, [doseRateGraphArray]);

  console.log('Limited data:', limitedData);

  // Define dynamic y-axis domain values
  const yMin = 0;
  
  // Calculate dynamic yMax based on the maximum value in the data
  const calculateYMax = useMemo(() => {
    // Default yMax if no data or all values are below 0.1
    const defaultYMax = 0.1;
    
    if (limitedData.length === 0) return defaultYMax;
    
    // Find the maximum dose rate value in the data
    const maxDoseRate = Math.max(...limitedData.map(point => point.doseRate));
    
    // If max value is less than default, just use default
    if (maxDoseRate <= defaultYMax) {return defaultYMax;}
    else{
      return (maxDoseRate + (maxDoseRate / 2 ))
    }

  }, [limitedData]);
  
  // Use the calculated yMax for the chart
  const yMax = calculateYMax;

  console.log('yMax:', yMax);
  



  const getLastTimestamp  = () : string =>{
    const timestamp = doseRateGraphArray.length > 0 ? doseRateGraphArray[doseRateGraphArray.length - 1].timestamp : 0;
    return timestamp ? format(new Date(timestamp), 'HH:mm:ss yyyy-MM-dd ') : 'No data';
  };


  const handleGetHistory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to the dose history page
    router.push('/dose-history');
    // Also call the provided callback if needed
    // onGetHistory();
  };

  // Create press state for tooltip
  const { state: pressState, isActive: isPressActive } = useChartPressState({ 
    x: 0, 
    y: { doseRate: 0 } 
  });
  
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
          formatYLabel: (value: number) => value.toFixed(3),
          tickCount: 8 // Control the number of y-axis labels
        }}
        domain={{ y: [yMin, yMax] }}
        transformState={transformState}
        transformConfig={{
          pan: { enabled: true, dimensions: ["x"] },
          pinch: { enabled: true, dimensions: ["x"] },
        }}
        // Connect press state for tooltips
        chartPressState={pressState}
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
            
            {/* Show tooltip when chart is pressed */}
            {isPressActive && pressState?.x && pressState?.y?.doseRate && (
              <>
                {/* Vertical line indicator */}
                <Line
                  points={[
                    { 
                      x: pressState.x.position.value, 
                      y: chartBounds.top,
                      xValue: pressState.x.value.value,
                      yValue: chartBounds.top
                    },
                    { 
                      x: pressState.x.position.value, 
                      y: chartBounds.bottom,
                      xValue: pressState.x.value.value,
                      yValue: chartBounds.bottom
                    }
                  ]}
                  color="rgba(30, 136, 229, 0.7)"
                  strokeWidth={1.5}
                  // strokeDashArray={[4, 4]}
                />
                
                {/* Small dot at the exact data point */}
                <Circle
                  cx={pressState.x.position.value}
                  cy={pressState.y.doseRate.position.value}
                  r={5}
                  color="#1E88E5"
                />
                
                {/* Create a background for the tooltip */}
                <Rect
                  x={pressState.x.position.value - 15}
                  y={pressState.y.doseRate.position.value - 70}
                  width={100}
                  height={50}
                  color="#F5F9FC"
                  
                />
                
                {/* Display tooltip with formatted values */}
                <SkiaText
                  x={pressState.x.position.value}
                  y={pressState.y.doseRate.position.value - 50}
                  text={`${pressState.y.doseRate.value.value.toFixed(3)} µSv/h`}
                  font={font}
                  color="#333333"
                 
                />
                <SkiaText
                  x={pressState.x.position.value}
                  y={pressState.y.doseRate.position.value - 30}
                  text={ `${format(new Date(pressState.x.value.value), 'HH:mm:ss')}`}
                  font={font}
                  color="#333333"
                 
                />
                
              </>
            )}
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
  tooltipText: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SPACING.sm,
    borderRadius: 4,
    fontSize: 12,
  },
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
