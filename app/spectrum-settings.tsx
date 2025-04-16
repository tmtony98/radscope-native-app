import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../Themes/theme';
import { SegmentedButtons } from 'react-native-paper';
import Header from '@/components/Header';






const data = [
  { label: 'Item 1', value: '1' },
  { label: 'Item 2', value: '2' },
  { label: 'Item 3', value: '3' },
  
];





export default function SpectrumSettings() {
  const router = useRouter();
  
  // State for settings
  const [energyAxis, setEnergyAxis] = useState(true);
  const [yAxisScaleType, setYAxisScaleType] = useState('Smoothy');
  const [sma, setSma] = useState(false);
  const [smoothingPoints, setSmoothingPoints] = useState(50);


  const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false)

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };
  
  return (
    <View style={{flex:1}}>
    <Header title="Spectrum Settings"  showBackButton={true} />
    <ScrollView style={styles.container}>
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Enable Energy Axis</Text>
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              energyAxis && styles.activeSegmentButton
            ]}
            onPress={() => setEnergyAxis(true)}
          >
            <View style={styles.buttonContent}>
              {energyAxis && (
                <MaterialIcons name="check" size={18} color="white" style={styles.buttonIcon} />
              )}
              <Text style={[
                styles.buttonText,
                energyAxis && styles.activeButtonText
              ]}>
                Energy Axis
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.segmentButton,
              !energyAxis && styles.activeSegmentButton
            ]}
            onPress={() => setEnergyAxis(false)}
          >
            <View style={styles.buttonContent}>
              {!energyAxis && (
                <MaterialIcons name="check" size={18} color="white" style={styles.buttonIcon} />
              )}
              <Text style={[
                styles.buttonText,
                !energyAxis && styles.activeButtonText
              ]}>
                ADC channels
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Y Axis scale type</Text>
        <View style={styles.dropdownContainer}>
          <Text style={styles.dropdownText}>{yAxisScaleType}</Text>
          {/* Dropdown logic here */}
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Y Axis smoothing type</Text>
        <View style={styles.settingRow}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>SMA</Text>
          <Switch
            value={sma}
            onValueChange={setSma}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Smoothing Points</Text>
        <View style={styles.sliderContainer}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>Selected Points: {smoothingPoints}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            // value={smoothingPoints}
            onValueChange={setSmoothingPoints}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginBottom: SPACING.lg,
  //   paddingVertical: 16,
  //   backgroundColor: '#F8FAFC',
  //   paddingHorizontal: 16,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#E5E7EB',
  //   height: 70,
  // },
  headerTitle: {
    flex: 2,
    textAlign: 'center',
    fontSize: 24,
  },
  backButton: {
    padding: 10,
    flex: 1,
    alignItems: 'flex-start',
  },
  saveButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
    padding: 10,
    flex: 1,
    textAlign: 'right',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  toggleButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    color: COLORS.text,
  },
  dropdownContainer: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  dropdownText: {
    color: COLORS.text,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  sliderContainer: {
    padding: SPACING.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  activeSegment: {
    backgroundColor: COLORS.primary,
  },
  inactiveSegment: {
    backgroundColor: COLORS.secondary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 30, // Pill shape
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: SPACING.sm,
    padding: 0, // No internal padding
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0, // No individual button radius
    marginHorizontal: 0, // No gaps between buttons
    backgroundColor: 'white', // White background for unselected
  },
  activeSegmentButton: {
    backgroundColor: '#334766', // Darker blue to match image
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#333',
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  activeButtonText: {
    color: 'white',
  },
  buttonIcon: {
    marginRight: 4, // Closer to text
  },
}); 