import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY , BUTTON_STYLE } from '../../Themes/theme';
import Header from '@/components/Header';
import { useSettingsContext } from '@/Provider/SettingsContext';
import { generalSettings } from '@/Provider/SettingsContext';
import StyledTextInput from '@/components/common/StyledTextInput';




export default function Settings() {
  const { getGeneralSettings , storeGeneralSettings, general_Settings_Key } = useSettingsContext();

  // Combined state using generalSettings type
  const [generalSettings, setGeneralSettings] = useState<generalSettings>({
    discoveryType: 'Local',
    Alarm: 0,
    serverCredentials: {
      IP_Address: '',
      port: 0,
    },
  });
console.log('generalSettings', generalSettings);

  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<generalSettings | null>(null);

  console.log('generalSettings', generalSettings);

  // Function to save the general settings
  const handleSave = async () => {
    try {
      const res = await storeGeneralSettings(generalSettings);
      console.log('Settings saved successfully:', res);
      setHasChanges(false);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Settings Saved',
        text2: 'Your general settings have been saved successfully',
        position: 'bottom',
        visibilityTime: 3000
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // Show error toast
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save settings',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  };

  const handleCancel = () => {
    if (initialSettings) {
      setGeneralSettings(initialSettings);
      setHasChanges(false);
    }
  };

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getGeneralSettings(general_Settings_Key);
        if (settings) {
          setGeneralSettings(settings);
          setInitialSettings(settings); // Store initial values
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [getGeneralSettings, general_Settings_Key]);

  // Update handlers
  const handleDiscoveryTypeChange = (type: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      discoveryType: type,
    }));
    setHasChanges(true);
  };

  const handleAlarmChange = (value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      Alarm: parseInt(value) || 0,
    }));
    setHasChanges(true);
  };

  const handleIpAddressChange = (value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      serverCredentials: {
        ...prev.serverCredentials,
        IP_Address: value,
      },
    }));
    setHasChanges(true);
  };

  const handlePortChange = (value: string) => {
    setGeneralSettings((prev) => ({
      ...prev,
      serverCredentials: {
        ...prev.serverCredentials,
        port: parseInt(value) || 0,
      },
    }));
    setHasChanges(true);
  };



  return (
    <View style={{flex:1}}>
      <Header title="General Settings" />
      <ScrollView style={styles.container}>
          <View style={CARD_STYLE.container}>
            <Text style={TYPOGRAPHY.headLineSmall}>Discovery Type</Text>
            
            {/* Custom segmented button */}
            <View style={styles.segmentedContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  generalSettings.discoveryType === 'Local' && styles.activeSegmentButton
                ]}
                onPress={() => handleDiscoveryTypeChange('Local')}
              >
                <View style={styles.buttonContent}>
                  {generalSettings.discoveryType === 'Local' && (
                    <MaterialIcons name="check" size={18} color={COLORS.white} style={styles.buttonIcon} />
                  )}
                  <Text style={[
                    styles.buttonText,
                    generalSettings.discoveryType === 'Local' && styles.activeButtonText
                  ]}>
                    Local
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  generalSettings.discoveryType === 'Cloud' && styles.activeSegmentButton
                ]}
                onPress={() => handleDiscoveryTypeChange('Cloud')}
              >
                <View style={styles.buttonContent}>
                  {generalSettings.discoveryType === 'Cloud' && (
                    <MaterialIcons name="check" size={18} color={COLORS.white} style={styles.buttonIcon} />
                  )}
                  <Text style={[
                    styles.buttonText,
                    generalSettings.discoveryType === 'Cloud' && styles.activeButtonText
                  ]}>
                    Cloud
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={CARD_STYLE.container}>
            <Text style={TYPOGRAPHY.headLineSmall}>Alarm</Text>
            <StyledTextInput
              label="Alarm Threshold"
              value={generalSettings.Alarm.toString()}
              keyboardType="numeric"
              onChangeText={handleAlarmChange}
              placeholder="Enter threshold Value"
            />
          </View>
          <View style={CARD_STYLE.container}>
            <Text style={TYPOGRAPHY.headLineSmall}>Server Credentials</Text>
            <StyledTextInput
              label="IP Address"
              value={generalSettings.serverCredentials.IP_Address}
              onChangeText={handleIpAddressChange}
              placeholder="Enter IP Address"
              style={{ marginBottom: SPACING.md }}
            />
            <StyledTextInput
              label="Port"
              value={generalSettings.serverCredentials.port.toString()}
              keyboardType="numeric"
              onChangeText={handlePortChange}
              placeholder="Enter Port Number"
            />
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[
                BUTTON_STYLE.mediumButton,
                styles.cancelBtn,
                !hasChanges && styles.disabledButton
              ]}
              onPress={handleCancel}
              disabled={!hasChanges}
            >
              <Text style={[styles.saveButtonText, !hasChanges && styles.disabledButtonText]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                BUTTON_STYLE.mediumButtonWithIconLeft,
                styles.saveButton,
                !hasChanges && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={!hasChanges}
            >
              <Text style={[styles.saveButtonText, !hasChanges && styles.disabledButtonText]}>Save Settings</Text>
            </TouchableOpacity>
          </View>
         
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  cancelBtn:{
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: SPACING.sm,
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
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  disabledButton: {
    opacity: 0.5
  },
  disabledButtonText: {
    opacity: 0.7
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});