import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMqttContext } from '../../Provider/MqttContext';
import { Area, CartesianChart, Line, useChartTransformState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { transformValue, ScaleType } from '@/utils/spectrumTransforms';
import { useSettingsContext } from '@/Provider/SettingsContext';

import inter from "../../assets/fonts/Inter/static/Inter_18pt-Bold.ttf";
type SpectrumCardProps = {
  duration?: string;
  onFullscreen?: () => void;
};

const SpectrumCard = ({
  duration = '222 s',
  onFullscreen = () => {},
}: SpectrumCardProps) => {
  const router = useRouter();
  const { spectrum } = useMqttContext();
  const { spectrumSettings } = useSettingsContext();
  const font = useFont(inter, 12);
  const [chartData, setChartData] = useState<Array<{x: number, y: number}>>([]);
  
  // Create transform state for optimized rendering
  const { state: transformState } = useChartTransformState({
    scaleX: 1.0,
    scaleY: 1.0,
  });
  
  // Process spectrum data with debouncing to prevent excessive calculations
  useEffect(() => {
    if (spectrum.length === 0) return;
    
    const processData = () => {
      // First downsample if needed
      let processedData;
      if (spectrum.length > 100) {
        processedData = downsampleData(spectrum);
      } else {
        processedData = spectrum.map((value, index) => ({ x: index, y: value }));
      }
      
      // Then apply transformation to y values based on selected scale type
      const scaleType = (spectrumSettings.scaleType || 'Linear').toLowerCase() as ScaleType;
      const transformedData = processedData.map(point => ({
        x: point.x,
        y: transformValue(point.y, scaleType)
      }));
      
      setChartData(transformedData);
    };
    
    // Process immediately for small datasets, debounce for large ones
    if (spectrum.length <= 100) {
      processData();
    } else {
      const timer = setTimeout(processData, 50);
      return () => clearTimeout(timer);
    }
  }, [spectrum, spectrumSettings.scaleType]);
  
  // Update Y-axis format based on scale type
  const getYAxisFormat = useCallback((value: number) => {
    const scaleType = (spectrumSettings.scaleType || 'Linear').toLowerCase() as ScaleType;
    switch (scaleType) {
      case 'logarithmic':
        return `10^${value.toFixed(1)}`;
      case 'square-root':
        return value.toFixed(1);
      default:
        // For linear scale, format numbers to avoid scientific notation
        if (isNaN(value) || !isFinite(value)) {
          return '0';
        } else if (Math.abs(value) < 1000) {
          return Math.round(value).toString();
        } else {
          // Format large numbers with commas
          return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
    }
  }, [spectrumSettings.scaleType]);

  const handleSettingsPress = useCallback(() => {
    router.push('/spectrum-settings');
  }, [router]);
  
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Spectrum</Text>
          {/* <Text style={styles.durationText}>{duration}</Text> */}
        </View>
        <TouchableOpacity 
          style={[BUTTON_STYLE.mediumButtonWithIconLeft, { backgroundColor: '#31435E' }]} 
          onPress={handleSettingsPress}
        >
          <MaterialIcons 
            name="settings" 
            size={24} 
            color="#fff" 
            style={BUTTON_STYLE.mediumButtonIconLeft} 
          />
          <Text style={[BUTTON_STYLE.mediumButtonText, { fontSize: 16 , marginTop: 4}]}>Settings</Text>
        </TouchableOpacity>
      </View>
      
      {/* <View style={styles.fullscreenButtonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onFullscreen}>
          <MaterialIcons name="fullscreen" size={24} color="#31435E" />
        </TouchableOpacity>
      </View> */}
     
      <View style={styles.chartPlaceholder}>
        {spectrum.length === 0 ? (
          <Text>No data available</Text>
        ) : (
          <View style={{ height: 250, width: '100%' }}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={["y"]}
              axisOptions={{
                font,
                lineWidth: 1,
                lineColor: "#CCCCCC",
                labelColor: "#333333",
                formatYLabel: getYAxisFormat
              }}
              xAxis={{
                font,
                tickCount: 5,
              }}
              // Set a reasonable y-axis range based on data
              domain={{ y: [0, Math.max(1, ...chartData.map(point => point.y * 1.1))] }}
              transformState={transformState}
              transformConfig={{
                pan: { enabled: true, dimensions: ["x"] },
                pinch: { enabled: true, dimensions: ["x"] },
              }}
            >
              {({ points, chartBounds }) => (
                <>
                  <Area
                    points={points.y}
                    y0={chartBounds.bottom}
                    color="rgba(30, 136, 229, 0.2)" // Light blue with transparency
                    curveType="natural"
                    opacity={0.6}
                  />
                  <Line
                    points={points.y}
                    color="#1E88E5"
                    strokeWidth={1.5}
                    curveType="natural"
                  />
                </>
              )}
            </CartesianChart>
          </View>
        )}
      </View>
      
      <Text style={styles.chartLabel}>
        Energy (Kev) vs Count ({spectrumSettings.scaleType || 'Linear'})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWithActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  fullscreenButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  iconButton: {
    padding: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 240,
    marginTop: 5,
  },
  yAxisLabels: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  axisLabel: {
    fontSize: 10,
    color: '#333',
  },
  chartContent: {
    flex: 1,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 0,
    paddingTop: 10,
    marginLeft: -30,
  },
  chartLabel: {
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    color: '#333',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#31435E',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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
  buttonContainer: {
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
});

// Min-max downsampling function to preserve visual characteristics
const downsampleData = (data: number[]): Array<{x: number, y: number}> => {
  const result = [];
  const targetPoints = 100; // Target number of points for visualization
  const bucketSize = Math.ceil(data.length / targetPoints);
  
  // For very large datasets, use a more aggressive approach
  if (data.length > 1000) {
    // Use a simple approach for extremely large datasets
    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, Math.min(i + bucketSize, data.length));
      if (bucket.length === 0) continue;
      
      // Find min, max and an average point in this bucket
      let sum = 0;
      let minValue = bucket[0];
      let maxValue = bucket[0];
      let minIndex = i;
      let maxIndex = i;
      
      for (let j = 0; j < bucket.length; j++) {
        const value = bucket[j];
        sum += value;
        if (value < minValue) {
          minValue = value;
          minIndex = i + j;
        }
        if (value > maxValue) {
          maxValue = value;
          maxIndex = i + j;
        }
      }
      
      // Only add points if they're significantly different
      const avgValue = sum / bucket.length;
      const midIndex = i + Math.floor(bucket.length / 2);
      
      // Add points based on their significance
      if (Math.abs(maxValue - minValue) > avgValue * 0.1) {
        // If there's significant variation, add both min and max
        if (minIndex < maxIndex) {
          result.push({ x: minIndex, y: minValue });
          result.push({ x: maxIndex, y: maxValue });
        } else {
          result.push({ x: maxIndex, y: maxValue });
          result.push({ x: minIndex, y: minValue });
        }
      } else {
        // If variation is minimal, just add one representative point
        result.push({ x: midIndex, y: avgValue });
      }
    }
  } else {
    // Use the original approach for smaller datasets
    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, Math.min(i + bucketSize, data.length));
      if (bucket.length === 0) continue;
      
      // Find min and max in this bucket
      let minValue = bucket[0];
      let maxValue = bucket[0];
      let minIndex = i;
      let maxIndex = i;
      
      for (let j = 0; j < bucket.length; j++) {
        const value = bucket[j];
        if (value < minValue) {
          minValue = value;
          minIndex = i + j;
        }
        if (value > maxValue) {
          maxValue = value;
          maxIndex = i + j;
        }
      }
      
      // Add min point first (if different from max)
      if (minIndex !== maxIndex) {
        if (minIndex < maxIndex) {
          result.push({ x: minIndex, y: minValue });
          result.push({ x: maxIndex, y: maxValue });
        } else {
          result.push({ x: maxIndex, y: maxValue });
          result.push({ x: minIndex, y: minValue });
        }
      } else {
        // If min and max are the same point
        result.push({ x: minIndex, y: minValue });
      }
    }
  }
  
  return result;
};

export default React.memo(SpectrumCard);
