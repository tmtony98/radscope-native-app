import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
export default function SpectrumSettings() {
  const router = useRouter();
  
  // State for settings
  const [logScale, setLogScale] = useState(true);
  const [autoScale, setAutoScale] = useState(true);
  const [gridLines, setGridLines] = useState(true);
  const [markers, setMarkers] = useState(true);
  const [smoothing, setSmoothing] = useState(50);
  const [minFreq, setMinFreq] = useState(0);
  const [maxFreq, setMaxFreq] = useState(3000);
  const [selectedColorScheme, setSelectedColorScheme] = useState('rainbow');
  
  // Add a function to handle reset to defaults
  const handleResetToDefaults = () => {
    setLogScale(true);
    setAutoScale(true);
    setGridLines(true);
    setMarkers(true);
    setSmoothing(50);
    setMinFreq(0);
    setMaxFreq(3000);
    setSelectedColorScheme('rainbow');
  };
  
  // Color scheme options
  const colorSchemes = [
    { id: 'rainbow', name: 'Rainbow', colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'] },
    { id: 'thermal', name: 'Thermal', colors: ['#000000', '#480000', '#900000', '#D80000', '#FF0000', '#FF8000', '#FFFF00'] },
    { id: 'grayscale', name: 'Grayscale', colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'] },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={TYPOGRAPHY.headLineMedium}>Spectrum Settings</Text>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Display Options</Text>
        
        <View style={styles.settingRow}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>Logarithmic Scale</Text>
          <Switch
            value={logScale}
            onValueChange={setLogScale}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>Auto Scale</Text>
          <Switch
            value={autoScale}
            onValueChange={setAutoScale}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>Grid Lines</Text>
          <Switch
            value={gridLines}
            onValueChange={setGridLines}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>Markers</Text>
          <Switch
            value={markers}
            onValueChange={setMarkers}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Color Scheme</Text>
        
        <View style={styles.colorSchemeContainer}>
          {colorSchemes.map((scheme) => (
            <TouchableOpacity 
              key={scheme.id}
              style={[
                styles.colorSchemeOption,
                selectedColorScheme === scheme.id && styles.selectedColorScheme
              ]}
              onPress={() => setSelectedColorScheme(scheme.id)}
            >
              <View style={styles.colorPreview}>
                {scheme.colors.map((color, index) => (
                  <View 
                    key={index} 
                    style={[styles.colorSample, { backgroundColor: color, width: `${100 / scheme.colors.length}%` }]} 
                  />
                ))}
              </View>
              <Text style={[
                TYPOGRAPHY.bodyTextMedium, 
                selectedColorScheme === scheme.id && { color: COLORS.primary }
              ]}>
                {scheme.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Frequency Range</Text>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelRow}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>Min Frequency</Text>
            <Text style={TYPOGRAPHY.bodyTextMedium}>{minFreq} Hz</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1000}
            value={minFreq}
            onValueChange={setMinFreq}
            step={10}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />
        </View>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelRow}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>Max Frequency</Text>
            <Text style={TYPOGRAPHY.bodyTextMedium}>{maxFreq} Hz</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={1000}
            maximumValue={10000}
            value={maxFreq}
            onValueChange={setMaxFreq}
            step={100}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />
        </View>
      </View>
      
      <View style={CARD_STYLE.container}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>Smoothing</Text>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLabelRow}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>Smoothing Level</Text>
            <Text style={TYPOGRAPHY.bodyTextMedium}>{smoothing}%</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            value={smoothing}
            onValueChange={setSmoothing}
            step={1}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => {
            // Save settings logic here
            router.back();
          }}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleResetToDefaults}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sliderContainer: {
    marginVertical: SPACING.md,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  colorSchemeContainer: {
    marginVertical: SPACING.sm,
  },
  colorSchemeOption: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedColorScheme: {
    borderColor: COLORS.primary,
   
  },
  colorPreview: {
    height: 24,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  colorSample: {
    height: '100%',
  },
  buttonContainer: {
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.white,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.white,
  },
}); 