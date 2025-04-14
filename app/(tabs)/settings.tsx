import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import * as SecureStore from 'expo-secure-store';


//gener

// async function save(key, value) {
//   await SecureStore.setItemAsync(key, value);
// }

// async function getValueFor(key) {
//   let result = await SecureStore.getItemAsync(key);
//   if (result) {
//     alert("🔐 Here's your value 🔐 \n" + result);
//   } else {
//     alert('No values stored under that key.');
//   }
// }

export default function Settings() {
  const [discoveryType, setDiscoveryType] = useState('local');
  const [threshold, setThreshold] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [portNumber, setPortNumber] = useState('');

  // Storage keys
  const KEYS = {
    DISCOVERY_TYPE: 'discoveryType',
    THRESHOLD: 'threshold',
    IP_ADDRESS: 'ipAddress',
    PORT_NUMBER: 'portNumber'
  };

  // Load saved settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load discovery type
        const savedDiscoveryType = await SecureStore.getItemAsync(KEYS.DISCOVERY_TYPE);
        if (savedDiscoveryType)
           setDiscoveryType(savedDiscoveryType);
        
        // Load threshold
        const savedThreshold = await SecureStore.getItemAsync(KEYS.THRESHOLD);
        if (savedThreshold)
          setThreshold(savedThreshold);
        
        // Load IP address
        const savedIpAddress = await SecureStore.getItemAsync(KEYS.IP_ADDRESS);
        if (savedIpAddress)
           setIpAddress(savedIpAddress);
        
        // Load port number
        const savedPortNumber = await SecureStore.getItemAsync(KEYS.PORT_NUMBER);
        if (savedPortNumber) 
          setPortNumber(savedPortNumber);
      } catch (error) {
        Alert.alert('Error', 'Failed to load settings');
      }
    };

    loadSettings();
  }, []);

  // Save individual setting
  const saveSetting = async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      // Alert.alert('Success', `${value} saved successfully`);
    } catch (error) {
      Alert.alert('Error', `Failed to save ${key}`);
    }
  };

  // Save all settings
  const saveAllSettings = async () => {
    try {
      await SecureStore.setItemAsync(KEYS.DISCOVERY_TYPE, discoveryType);
      await SecureStore.setItemAsync(KEYS.THRESHOLD, threshold);
      await SecureStore.setItemAsync(KEYS.IP_ADDRESS, ipAddress);
      await SecureStore.setItemAsync(KEYS.PORT_NUMBER, portNumber);
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Handle discovery type change
  const handleDiscoveryTypeChange = (type: string ) => {
    setDiscoveryType(type);
    saveSetting(KEYS.DISCOVERY_TYPE, type);
  };

  return (
    <View style={styles.container}>
      <Text style={TYPOGRAPHY.headLineMedium}>Settings</Text>

      <View style={CARD_STYLE.container}>
        <Text style={TYPOGRAPHY.headLineSmall}>Discovery Type</Text>
        
        {/* Custom segmented button */}
        <View style={styles.segmentedContainer}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              discoveryType === 'local' && styles.activeSegmentButton
            ]}
            onPress={() => handleDiscoveryTypeChange('local')}
          >
            <View style={styles.buttonContent}>
              {discoveryType === 'local' && (
                <MaterialIcons name="check" size={18} color={COLORS.white} style={styles.buttonIcon} />
              )}
              <Text style={[
                styles.buttonText,
                discoveryType === 'local' && styles.activeButtonText
              ]}>
                Local
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.segmentButton,
              discoveryType === 'cloud' && styles.activeSegmentButton
            ]}
            onPress={() => handleDiscoveryTypeChange('cloud')}
          >
            <View style={styles.buttonContent}>
              {discoveryType === 'cloud' && (
                <MaterialIcons name="check" size={18} color={COLORS.white} style={styles.buttonIcon} />
              )}
              <Text style={[
                styles.buttonText,
                discoveryType === 'cloud' && styles.activeButtonText
              ]}>
                Cloud
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={CARD_STYLE.container}>
        <Text style={TYPOGRAPHY.headLineSmall}>Alarm</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter threshold Value"
          value={threshold}
          onChangeText={(value) => {
            setThreshold(value);
            saveSetting(KEYS.THRESHOLD, value);
          }}
        />
      </View>

      <View style={CARD_STYLE.container}>
        <Text style={TYPOGRAPHY.headLineSmall}>Server Credentials</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter IP Address"
          value={ipAddress}
          onChangeText={(value) => {
            setIpAddress(value);
            saveSetting(KEYS.IP_ADDRESS, value);
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Port Number"
          value={portNumber}
          onChangeText={(value) => {
            setPortNumber(value);
            saveSetting(KEYS.PORT_NUMBER, value);
          }}
        />
      </View>

      {/* <TouchableOpacity style={styles.saveButton} onPress={saveAllSettings}>
        <Text style={styles.saveButtonText}>Save All Settings</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
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
  input: {
    height: 50,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
});