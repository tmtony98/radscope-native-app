import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY , BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';

type SpectrumCardProps = {
  duration?: string;
  onFullscreen?: () => void;
};

export default function SpectrumCard({
  duration = '222 s',
  onFullscreen = () => {},
}: SpectrumCardProps) {
  const router = useRouter();
  
 
  
  const handleSettingsPress = () => {
    router.push('/spectrum-settings');
  };
  // Mock data for the spectrum chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const energyValues = {
    data: [800, 850, 900, 870, 920, 850, 900, 850, 800, 750, 700, 650],
  };
  
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Spectrum</Text>
          <Text style={styles.durationText}>{duration}</Text>
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
      
      <View style={styles.fullscreenButtonContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={onFullscreen}>
          <MaterialIcons name="fullscreen" size={24} color="#31435E" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>1200</Text>
          <Text style={styles.axisLabel}>1100</Text>
          <Text style={styles.axisLabel}>1000</Text>
          <Text style={styles.axisLabel}>900</Text>
          <Text style={styles.axisLabel}>800</Text>
          <Text style={styles.axisLabel}>700</Text>
          <Text style={styles.axisLabel}>600</Text>
          <Text style={styles.axisLabel}>500</Text>
          <Text style={styles.axisLabel}>400</Text>
          <Text style={styles.axisLabel}>300</Text>
          <Text style={styles.axisLabel}>200</Text>
          <Text style={styles.axisLabel}>100</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>
        
        <View style={styles.chartContent}>
          <LineChart
            data={{
              labels: months,
              datasets: [
                {
                  data: energyValues.data,
                  color: () => '#7BBC47', // Green line color adjusted
                  strokeWidth: 3,
                },
              ],
            }}
            width={Dimensions.get('window').width - 100}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#333',
              labelColor: () => '#333',
              propsForBackgroundLines: {
                stroke: '#E5E5E5',
                strokeWidth: 1,
              },
              propsForLabels: {
                fontSize: 10,
              },
              propsForHorizontalLabels: {
                fontSize: 9,
              }
            }}
            bezier
            style={styles.chart}
            withHorizontalLines={true}
            withVerticalLines={false}
            withDots={false}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
            fromZero
          />
        </View>
      </View>
      
      <Text style={styles.chartLabel}>Energy (Kev) vs Count</Text>
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
});
