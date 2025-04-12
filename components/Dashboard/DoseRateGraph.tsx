import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMqttContext } from '@/Provider/MqttContext';
import { LineChart } from 'react-native-chart-kit';


type ChartCardProps = {
  // onFullscreen?: () => void;
  onGetHistory?: () => void;
};

const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export default function DoseRateGraph({ onGetHistory }: ChartCardProps) {

  const { doseRateArray, timestampArray, timestamp } = useMqttContext();
  const router = useRouter();

  const TimeLabels = timestampArray.slice(-5).map((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  });

  const DoseRateLabels = doseRateArray.slice(-6)
  console.log("DoseRateLabels", DoseRateLabels);

  // const handleFullscreen = () => {
  //   if (Platform.OS !== 'web') {
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //   }
  //   onFullscreen();
  // };

  const handleGetHistory = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Navigate to the dose history page
    router.push('/dose-history');
    // Also call the provided callback if needed
    // onGetHistory();
  };

  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>Dose Rate</Text>
        <View style={styles.headerActions}>
          <Text style={TYPOGRAPHY.smallText}>{timestamp}</Text>
          {/* <TouchableOpacity style={styles.iconButton} onPress={handleFullscreen}>
            <MaterialIcons name="fullscreen" size={24} color={COLORS.primary} />
          </TouchableOpacity> */}
        </View>
      </View>
      <View style={styles.chartPlaceholder}>
        {doseRateArray.length === 0 || timestampArray.length === 0 ? (
          <Text>No data available</Text>
        ) : (
          <View>

            <LineChart
              data={{
                labels: TimeLabels,
                datasets: [
                  {
                    data: DoseRateLabels
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
