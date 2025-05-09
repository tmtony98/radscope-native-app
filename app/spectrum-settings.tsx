import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { Dropdown } from 'react-native-element-dropdown';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../Themes/theme';
import Header from '@/components/Header';
import { useSettingsContext } from '@/Provider/SettingsContext';
import { spectrumSettings } from '@/Provider/SettingsContext';

// Add scale type data near the top of your file, after imports
const scaleTypeData = [
  { label: 'Linear', value: 'linear' },
  { label: 'Logarithmic', value: 'logarithmic' },
  { label: 'Square Root', value: 'square-root' }
];


// const defaultSettings = {
//   energyAxis: 'Energy Axis',
//   scaleType: 'Smoothy',
//   smoothingType: false,
//   smoothingPoints: 50

export default function SpectrumSettings() {
  const router = useRouter();
  const { getSpectrumSettings, storeSpectrumSettings, spectrum_Settings_Key } = useSettingsContext();

  // Combined state using spectrumSettings type
  const [spectrumSettings, setSpectrumSettings] = useState<spectrumSettings>({
    energyAxis: 'Energy Axis',
    scaleType: 'Smoothy',
    smoothingType: false,
    smoothingPoints: 50
  });


  console.log('spectrumSettings', spectrumSettings);

//write fn to setting the spectrum settings
  const handleSave = async () => {
    try {
    const res =  await storeSpectrumSettings(spectrumSettings);
      console.log("Settings saved successfully:", res);
      
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Save settings on unmount
  useEffect(() => {
    return () => {
      handleSave()
    };
  }, [spectrumSettings]);

  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getSpectrumSettings(spectrum_Settings_Key);
        if (settings) {
          setSpectrumSettings(settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Update handlers
  const handleEnergyAxisChange = (value: string) => {
    setSpectrumSettings(prev => ({
      ...prev,
      energyAxis: value
    }));
   handleSave()

  };

  const handleScaleTypeChange = (value: string) => {
    setSpectrumSettings(prev => ({
      ...prev,
      scaleType: value
    }));
    handleSave()
  };

  const handleSmoothingTypeChange = (value: boolean) => {
    setSpectrumSettings(prev => ({
      ...prev,
      smoothingType: value
    }));
    handleSave()
  };

  const handleSmoothingPointsChange = (value: number) => {
    setSpectrumSettings(prev => ({
      ...prev,
      smoothingPoints: value
    }));
    handleSave()
  };

  return (
    <View style={{flex:1}}>
      <Header title="Spectrum Settings" showBackButton={true} />
      <ScrollView style={styles.container}>
        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Enable Energy Axis</Text>
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                spectrumSettings.energyAxis === 'Energy Axis' && styles.activeSegmentButton
              ]}
              onPress={() => handleEnergyAxisChange('Energy Axis')}
            >
              <View style={styles.buttonContent}>
                {spectrumSettings.energyAxis === 'Energy Axis' && (
                  <MaterialIcons name="check" size={18} color="white" style={styles.buttonIcon} />
                )}
                <Text style={[
                  styles.buttonText,
                  spectrumSettings.energyAxis === 'Energy Axis' && styles.activeButtonText
                ]}>
                  Energy Axis
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.segmentButton,
                spectrumSettings.energyAxis === 'ADC channels' && styles.activeSegmentButton
              ]}
              onPress={() => handleEnergyAxisChange('ADC channels')}
            >
              <View style={styles.buttonContent}>
                {spectrumSettings.energyAxis === 'ADC channels' && (
                  <MaterialIcons name="check" size={18} color="white" style={styles.buttonIcon} />
                )}
                <Text style={[
                  styles.buttonText,
                  spectrumSettings.energyAxis === 'ADC channels' && styles.activeButtonText
                ]}>
                  ADC channels
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Y Axis scale type</Text>
          <Dropdown
            style={styles.dropdown}
            selectedTextStyle={styles.selectedTextStyle}
            placeholderStyle={styles.placeholderStyle}
            data={scaleTypeData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select scale type"
            value={spectrumSettings.scaleType}
            onChange={item => handleScaleTypeChange(item.value)}
          />
        </View>
        
        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Y Axis smoothing type</Text>
          <View style={styles.settingRow}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>SMA</Text>
            <Switch
              value={spectrumSettings.smoothingType}
              onValueChange={handleSmoothingTypeChange}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
        
        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Smoothing Points</Text>
          <View style={styles.sliderContainer}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>
              Selected Points: {spectrumSettings.smoothingPoints}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={spectrumSettings.smoothingPoints}
              onValueChange={handleSmoothingPointsChange}
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
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: SPACING.sm,
    padding: 0,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    marginHorizontal: 0,
    backgroundColor: 'white',
  },
  activeSegmentButton: {
    backgroundColor: '#334766',
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
    marginRight: 4,
  },
  dropdown: {
    height: 50,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: COLORS.text,
  },
  placeholderStyle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});