import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { Dropdown } from "react-native-element-dropdown";
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from "../Themes/theme";
import Header from "@/components/Header";
import { useSettingsContext } from "@/Provider/SettingsContext";
import { SpectrumSettings as SpectrumSettingsType } from "@/Provider/SettingsContext";
import Toast from 'react-native-toast-message';

const scaleTypeData = [
  { label: "Linear", value: "linear" },
  { label: "Logarithmic", value: "logarithmic" },
  { label: "Square Root", value: "square-root" },
];

const SpectrumSettings = () => {
  const { getSpectrumSettings, storeSpectrumSettings, spectrumSettings: contextSpectrumSettings } = useSettingsContext();

  // Initialize state with default values first
  const [spectrumSettings, setSpectrumSettings] = useState<SpectrumSettingsType>({
    energyAxis: "Energy Axis",
    scaleType: "smoothy",
    smoothingType: false,
    smoothingPoints: 50,
  });
  
  // Additional state for slider jitter prevention
  const [displaySmoothingPoints, setDisplaySmoothingPoints] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  const smoothingPointsRef = useRef(50);
  
  // Set initial values from context when component mounts
  useEffect(() => {
    console.log('Initial context spectrum settings:', contextSpectrumSettings);
    setSpectrumSettings(contextSpectrumSettings);
    setDisplaySmoothingPoints(contextSpectrumSettings.smoothingPoints);
    smoothingPointsRef.current = contextSpectrumSettings.smoothingPoints;
  }, []);

  // Save settings handler
  const handleSave = useCallback(async () => {
    try {
      await storeSpectrumSettings(spectrumSettings);
 setTimeout(() => {
  Toast.show({
    type: 'success',
    text1: 'Settings Saved',
    text2: 'Your spectrum settings have been saved',
    position: 'bottom',
    visibilityTime: 3000
  });
 }, 2000);
    
    } catch (error) {
      console.error("Error saving settings:", error);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save settings',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  }, [spectrumSettings, storeSpectrumSettings]);


  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Get settings from storage
        const settings = await getSpectrumSettings();
        console.log('Loaded spectrum settings from storage:', settings);
        // Update all state with the loaded settings
        setSpectrumSettings(settings);
        setDisplaySmoothingPoints(settings.smoothingPoints);
        smoothingPointsRef.current = settings.smoothingPoints;
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    // Load settings after a short delay to ensure context is fully initialized
    const timer = setTimeout(() => {
      loadSettings();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [getSpectrumSettings]);

  // Auto-save when settings change
  // useEffect(() => {
  //   handleSave();
  // }, [spectrumSettings, handleSave]);

  // Update handlers with useCallback for better performance
  const handleEnergyAxisChange = useCallback((value: string) => {
    setSpectrumSettings((prev) => ({
      ...prev,
      energyAxis: value,
    }));
    handleSave();
    Toast.show({
      type: 'info',
      text1: 'Energy Axis Updated',
      text2: `Changed to ${value}`,
      position: 'bottom',
      visibilityTime: 2000
    });
  }, []);

  const handleScaleTypeChange = useCallback((value: string) => {
    setSpectrumSettings((prev) => ({
      ...prev,
      scaleType: value,
    }));
    handleSave();

    Toast.show({
      type: 'info',
      text1: 'Scale Type Updated',
      text2: `Changed to ${value}`,
      position: 'bottom',
      visibilityTime: 2000
    });
  }, []);

  const handleSmoothingTypeChange = useCallback((value: boolean) => {
    setSpectrumSettings((prev) => ({
      ...prev,
      smoothingType: value,
    }));
    handleSave();

    Toast.show({
      type: 'info',
      text1: 'Smoothing Type Updated',
      text2: `Changed to ${value ? 'Enabled' : 'Disabled'}`,
      position: 'bottom',
      visibilityTime: 2000
    });
  }, []);

  const handleSmoothingPointsSliding = useCallback((value: number) => {
    smoothingPointsRef.current = value;
    setDisplaySmoothingPoints(Math.round(value)); // Round for better UX
  }, []);

  const handleSmoothingPointsComplete = useCallback(() => {
    const roundedValue = Math.round(smoothingPointsRef.current);
    setSpectrumSettings((prev) => ({
      ...prev,
      smoothingPoints: roundedValue,
    }));
    setIsSliding(false);
    handleSave();

    Toast.show({
      type: 'info',
      text1: 'Smoothing Points Updated',
      text2: `Set to ${roundedValue} points`,
      position: 'bottom',
      visibilityTime: 2000
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Spectrum Settings" showBackButton={true} />
      <ScrollView style={styles.container}>
        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>
            Enable Energy Axis
          </Text>
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                spectrumSettings.energyAxis === "Energy Axis" &&
                  styles.activeSegmentButton,
              ]}
              onPress={() => handleEnergyAxisChange("Energy Axis")}
            >
              <View style={styles.buttonContent}>
                {spectrumSettings.energyAxis === "Energy Axis" && (
                  <MaterialIcons
                    name="check"
                    size={18}
                    color="white"
                    style={styles.buttonIcon}
                  />
                )}
                <Text
                  style={[
                    styles.buttonText,
                    spectrumSettings.energyAxis === "Energy Axis" &&
                      styles.activeButtonText,
                  ]}
                >
                  Energy Axis
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                spectrumSettings.energyAxis === "ADC channels" &&
                  styles.activeSegmentButton,
              ]}
              onPress={() => handleEnergyAxisChange("ADC channels")}
            >
              <View style={styles.buttonContent}>
                {spectrumSettings.energyAxis === "ADC channels" && (
                  <MaterialIcons
                    name="check"
                    size={18}
                    color="white"
                    style={styles.buttonIcon}
                  />
                )}
                <Text
                  style={[
                    styles.buttonText,
                    spectrumSettings.energyAxis === "ADC channels" &&
                      styles.activeButtonText,
                  ]}
                >
                  ADC channels
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>
            Y Axis scale type
          </Text>
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
            onChange={(item) => handleScaleTypeChange(item.value)}
          />
        </View>

        <View style={CARD_STYLE.container}>
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>
            Y Axis smoothing type
          </Text>
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
          <Text style={[TYPOGRAPHY.headLineSmall, styles.sectionTitle]}>
            Smoothing Points
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>
              Selected Points: {isSliding ? displaySmoothingPoints : spectrumSettings.smoothingPoints}
            </Text>
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.sliderControl}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={spectrumSettings.smoothingPoints}
                onValueChange={handleSmoothingPointsSliding}
                onSlidingStart={() => setIsSliding(true)}
                onSlidingComplete={handleSmoothingPointsComplete}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.textSecondary}
                thumbTintColor={COLORS.primary}
              />
              {isSliding && (
                <View
                  style={[
                    styles.valueIndicator,
                    {
                      left: `${(displaySmoothingPoints / 100) * 100}%`,
                      transform: [{ translateX: -20 }],
                    },
                  ]}
                >
                  <Text style={styles.valueIndicatorText}>{displaySmoothingPoints}</Text>
                </View>
              )}
            </View>
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
    textAlign: "center",
    fontSize: 24,
  },
  backButton: {
    padding: 10,
    flex: 1,
    alignItems: "flex-start",
  },
  saveButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
    padding: 10,
    flex: 1,
    textAlign: "right",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: SPACING.md,
  },
  toggleButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
  },
  sliderContainer: {
    padding: SPACING.md,
  },
  sliderWrapper: {
    width: "100%",
    height: 40,
    position: "relative",
    justifyContent: "center",
  },
  sliderControl: {
    width: "100%",
    height: 40,
  },
  valueIndicator: {
    position: "absolute",
    top: -20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  valueIndicatorText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
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
    flexDirection: "row",
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginVertical: SPACING.sm,
    padding: 0,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    marginHorizontal: 0,
    backgroundColor: "white",
  },
  activeSegmentButton: {
    backgroundColor: "#334766",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#333",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
  activeButtonText: {
    color: "white",
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

export default SpectrumSettings;
