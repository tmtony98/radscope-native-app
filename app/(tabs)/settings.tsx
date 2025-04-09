import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';

export default function Settings() {
  const [discoveryType, setDiscoveryType] = useState('local');
  const [threshold, setThreshold] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [portNumber, setPortNumber] = useState('');

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
            onPress={() => setDiscoveryType('local')}
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
            onPress={() => setDiscoveryType('cloud')}
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
          onChangeText={setThreshold}
        />
      </View>

      <View style={CARD_STYLE.container}>
        <Text style={TYPOGRAPHY.headLineSmall}>Server Credentials</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter IP Address"
          value={ipAddress}
          onChangeText={setIpAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Port Number"
          value={portNumber}
          onChangeText={setPortNumber}
        />
      </View>
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
});