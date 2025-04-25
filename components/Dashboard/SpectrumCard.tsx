import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY , BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { useMqttContext } from '../../Provider/MqttContext';
type SpectrumCardProps = {
  duration?: string;
  onFullscreen?: () => void;
};

export default function SpectrumCard({
  duration = '222 s',
  onFullscreen = () => {},
}: SpectrumCardProps) {
  const router = useRouter();

  const { spectrum } = useMqttContext();
  
 
  
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
        {spectrum.length === 0 || spectrum.length === 0 ? (
          <Text>No data available</Text>
        ) : (
          <View>

            <LineChart
              data={{
                labels: spectrum.map(String),
                datasets: [
                  {
                    data: spectrum
                  }
                ]
              }}
              width={Dimensions.get("window").width - 60}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(14, 23, 37, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 0,
                borderRadius: 10,
              }}
            />
          </View>
        )}
      
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


