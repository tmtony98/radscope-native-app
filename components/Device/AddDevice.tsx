import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme'
import StyledTextInput from '../common/StyledTextInput'
import { useRouter } from 'expo-router'
import { AddDeviceProps } from './TopbarConnectTab'
import { useMqttContext } from '@/Provider/MqttContext'
import { useDeviceContext } from '@/Provider/DeviceContext'

const AddDevice: React.FC<AddDeviceProps> = ({ connectDevice }) => {
  const [deviceName, setDeviceName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const router = useRouter()
  const mqttContext = useMqttContext();
  const [isConnecting, setIsConnecting] = useState(false)

  // use deviceContext and load ip address\
  const deviceContext = useDeviceContext();
  const { connectedDevice } = deviceContext;
  
  const { status } = mqttContext;

  useEffect(() => {
    if (connectedDevice) {
      setIpAddress(connectedDevice.host)
    }
    setIsConnecting(status.connected)
  }, [status.connected])

  

  const handleConnect = async () => {
    // console.log('Connecting to device:', deviceName, 'IP:', ipAddress)
    
    // Validate inputs
    if (!deviceName.trim()) {
      Alert.alert('Error', 'Please enter a device name')
      return
    }

    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter an IP address')
      return
    }
    
    try {
      // Format the device to match our Device type
      const device = {
        name: deviceName,
        host: ipAddress,
        isConnected: true
      }
      
      // Connect the device using props
      await connectDevice(device)
      
      Alert.alert(
        'Device Connected',
        `Successfully connected to ${deviceName}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/') // Navigate to the index page
          }
        ]
      )
      
      // Clear inputs
      handleCancel()
    } catch (error) {
      console.error('Failed to connect device:', error)
      Alert.alert(
        'Connection Failed',
        'There was an error connecting to the device. Please try again.',
        [{ text: 'OK' }]
      )
    }
  }

  const handleCancel = () => {
    setDeviceName('')
    setIpAddress('')
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <Text style={[TYPOGRAPHY.headLineSmall, {textAlign: 'center', paddingVertical: SPACING.sm}]}>Connect Device</Text>
      <Text style={styles.instructions}>
        Find the IP address of the device to be connected by heading over to settings {'>'} network {'>'} Device Ip address
      </Text>

      <View style={styles.inputContainer}>
        <StyledTextInput
          label="Enter Device Name"
          placeholder="Enter Device name"
          value={deviceName}
          onChangeText={setDeviceName}
          style={styles.input}
        /> 
      </View>
      <View style={styles.inputContainer}>
        <StyledTextInput
          label="Enter IP Address"
          placeholder="Enter IP Address"
          value={ipAddress}
          onChangeText={setIpAddress}
          style={styles.input}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[BUTTON_STYLE.mediumButton, {backgroundColor: COLORS.error}, {marginRight: SPACING.sm}]} 
          onPress={handleCancel}
          disabled={isConnecting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={BUTTON_STYLE.mediumButton} 
          onPress={handleConnect}
          // disabled={isConnecting}
        >
          <Text style={styles.connectButtonText}>
            Connect
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 80, // Add extra padding at the bottom to ensure content is visible above bottom nav
  },
  title: {
    ...TYPOGRAPHY.headLineMedium,
    marginBottom: SPACING.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  instructions: {
    ...TYPOGRAPHY.bodyTextMedium,
    marginBottom: SPACING.md,
    textAlign: 'left',
    color: COLORS.text,
  },
  inputContainer: {
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    ...TYPOGRAPHY.smallText,
    marginBottom: SPACING.xs,
    textAlign: 'left',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg, // Add extra margin at the bottom
  },
  cancelButton: {
    ...BUTTON_STYLE.mediumButton,
    flex: 1,
    marginRight: SPACING.md,
    backgroundColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.white,
      fontFamily: 'Poppins-Medium',
      fontSize: 16,
      marginLeft: SPACING.sm,
  },
  connectButton: {
    ...BUTTON_STYLE.mediumButton,
    flex: 1,
  },
  connectButtonText: {
   
      color: COLORS.white,
      fontFamily: 'Poppins-Medium',
      fontSize: 16,
      marginLeft: SPACING.sm,
  },
});

export default AddDevice