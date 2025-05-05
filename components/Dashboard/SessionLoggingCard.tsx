import { View, Text, StyleSheet, TouchableOpacity, Platform, Share, Alert, PermissionsAndroid, Linking } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

type SessionLoggingCardProps = {
  onDownload?: () => void;
  onStart?: () => void;
  onStopSuccess?: () => void;
  isLogging?: boolean;
  activeSessionId?: string | null;
  timeLimit?: number;
  timeInterval?: number;
  onTimeLimitChange?: (value: number) => void;
  onTimeIntervalChange?: (value: number) => void;
};




export const SessionLoggingCard = ({
  // Default values are provided here to ensure that if the parent component does not supply these props,
  // the component will still function without throwing errors. For example, if onStart, onDownload, or onStopSuccess
  // are not passed, they default to no-op functions, preventing undefined function errors when called.
  // Similarly, isLogging and activeSessionId default to false and null, providing safe initial states.
  onStart = () => {},
  onDownload = () => {},
  onStopSuccess = () => {},
  isLogging = false,
  activeSessionId = null,
  timeLimit = 0,
  timeInterval = 1,
  onTimeLimitChange = () => {},
  onTimeIntervalChange = () => {},
}: SessionLoggingCardProps) => {

  // Define base path for storage
  // const BASE_PATH = Platform.OS === 'android' 
  // ? RNFS.ExternalStorageDirectoryPath + '/radscope' 
  // : RNFS.DocumentDirectoryPath + '/radscope';

  const BASE_PATH = "";

  // Check if the app has storage permission using arrow function
  const checkStoragePermission = async () => {
    try {
      if (Platform.OS !== 'android') {
        return true; // iOS doesn't need runtime permissions for app directory
      }
      
      // For Android 10 and below, check READ_EXTERNAL_STORAGE permission
      // Platform.Version is a number on Android and a string on iOS
      if (Platform.OS === 'android' && Platform.Version < 30) {
        const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        return result;
      }
      
      // For Android 11+, we can't check MANAGE_EXTERNAL_STORAGE programmatically
      // We'll assume we don't have it and request it when needed
      return false;
    } catch (err) {
      console.error("Error checking storage permission:", err);
      return false;
    }
  };

  // Request storage permissions using arrow function
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS !== 'android') {
        return true; // iOS doesn't need runtime permissions for app directory
      }
      
      // For Android 11+ (API level 30+), we need to use MANAGE_EXTERNAL_STORAGE permission
      // Platform.Version is a number on Android and a string on iOS
      if (Platform.OS === 'android' && Platform.Version >= 30) {
        console.log("Android 11+ detected");
        
        // We need to direct the user to the system settings page
        Alert.alert(
          "Storage Permission Required",
          "RadScope needs permission to manage files on your device. Please grant 'Allow access to manage all files' on the next screen.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => console.log("Permission denied")
            },
            {
              text: "Open Settings",
              onPress: () => {
                // Open the system settings page using Linking
                Linking.openSettings();
              }
            }
          ]
        );
        
        // We'll return false here as the user needs to grant permission in settings
        return false;
      } else {
        // For Android 10 and below, we can use READ_EXTERNAL_STORAGE permission
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "RadScope needs access to your storage to save data files.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error("Error requesting storage permission:", err);
      return false;
    }
  };

  // Ensure directory exists using arrow function
  const ensureDirectoryExists = async (dirPath: string) => {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        await RNFS.mkdir(dirPath);
      }
      return true;
    } catch (error) {
      console.error('Error creating directory:', error);
      return false;
    }
  };

  // Function to save data to a location that persists after app uninstallation
  const saveDataToDownloads = async (data: any) => {
    try {
      // Generate a unique filename with timestamp
      const date = new Date();
      const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
      const timeStr = `${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;
      const fileName = `radscope_export_${dateStr}_${timeStr}.json`;
      
      // Format the data as a pretty-printed JSON string
      const jsonString = JSON.stringify(data, null, 2);
      
      // First check if we already have permission
      const hasPermission = await checkStoragePermission();
      
      if (hasPermission) {
        try {
          // Ensure the base directory exists
          await ensureDirectoryExists(BASE_PATH);
          
          // Create the full file path
          const filePath = `${BASE_PATH}/${fileName}`;
          
          // Write the data to the file
          await RNFS.writeFile(filePath, jsonString, 'utf8');
          
          // Alert the user that the file was saved
          Alert.alert(
            'File Saved',
            `Data saved to ${filePath}`,
            [
              { 
                text: 'Share File', 
                onPress: async () => {
                  try {
                    await Share.share({
                      title: `RadScope Data Export - ${dateStr}`,
                      message: 'Share your RadScope data',
                      url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
                    });
                  } catch (error) {
                    console.error('Error sharing file:', error);
                  }
                } 
              },
              { text: 'OK' }
            ]
          );
          
          return true;
        } catch (error) {
          console.error('Error saving to file system:', error);
          // Fall back to requesting permission and Share API
        }
      }
      
      // If we don't have permission, request it
      const permissionRequested = await requestStoragePermission();
      
      // If permission was granted through the request, try saving again
      // Platform.Version is a number on Android and a string on iOS
      if (permissionRequested && Platform.OS === 'android' && Platform.Version < 30) {
        try {
          // Ensure the base directory exists
          await ensureDirectoryExists(BASE_PATH);
          
          // Create the full file path
          const filePath = `${BASE_PATH}/${fileName}`;
          
          // Write the data to the file
          await RNFS.writeFile(filePath, jsonString, 'utf8');
          
          // Alert the user that the file was saved
          Alert.alert(
            'File Saved',
            `Data saved to ${filePath}`,
            [
              { 
                text: 'Share File', 
                onPress: async () => {
                  try {
                    await Share.share({
                      title: `RadScope Data Export - ${dateStr}`,
                      message: 'Share your RadScope data',
                      url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
                    });
                  } catch (error) {
                    console.error('Error sharing file:', error);
                  }
                } 
              },
              { text: 'OK' }
            ]
          );
          
          return true;
        } catch (error) {
          console.error('Error saving to file system after permission granted:', error);
          // Fall back to Share API
        }
      }
      
      // If permissions not granted or file save failed, use Share API as fallback
      await Share.share({
        title: `RadScope Data Export - ${dateStr}`,
        message: `RadScope Data Export\n\nFilename: ${fileName}\n\n${jsonString}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error saving data to Downloads:', error);
      return false;
    }
  };
  //
  
  return (
    <View style={CARD_STYLE.container}>
      <Text style={TYPOGRAPHY.headLineSmall}>Session Logging</Text>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.smallText, { textAlign: 'left' }]}>Logging Time Limit (hrs)</Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>0</Text>
          <Slider
            style={{ width: '85%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
          />
          <Text style={TYPOGRAPHY.smallText}>100</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.smallText, { textAlign: 'left' }]}>Logging Time Interval (s)</Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>0</Text>
          <Slider
            style={{ width: '85%', height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
          />
          <Text style={TYPOGRAPHY.smallText}>100</Text>
        </View>
      </View>
      <View style={styles.loggingButtons}>
        <TouchableOpacity 
          style={styles.downloadButton} 
          onPress={async () => {
            try {
              // First call the original download handler
              onDownload();
              
              // Create sample data to export (replace with your actual data)
              const exportData = {
                timestamp: new Date().toISOString(),
                sessionInfo: {
                  date: new Date().toISOString(),
                  deviceId: 'GS200X1-Device',
                  // Add more session data here
                },
                data: {
                  // Add your actual measurement data here
                  sample: "This is sample data",
                  readings: [
                    { time: new Date().toISOString(), value: 0.42 },
                    { time: new Date(Date.now() - 1000).toISOString(), value: 0.36 }
                  ]
                }
              };
              
              // Save data to a persistent location
              const success = await saveDataToDownloads(exportData);
              
              if (success) {
                Alert.alert(
                  'Export Successful',
                  'Your data has been exported. You can choose where to save it.'
                );
              } else {
                throw new Error('Export failed');
              }
            } catch (error) {
              console.error('Error during export:', error);
              Alert.alert(
                'Export Failed',
                'There was an error exporting your data. Please try again.'
              );
            }
          }}
        >
          <MaterialIcons name="download" size={24} color={COLORS.primary} />
          <Text style={styles.downloadButtonText}>Download Files</Text>
        </TouchableOpacity>
        <TouchableOpacity style={BUTTON_STYLE.mediumButtonWithIconLeft} onPress={onStart}>
          <MaterialIcons name="play-arrow" size={24} color={COLORS.white} />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    marginVertical: SPACING.sm,
  },
  slider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  loggingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
    paddingVertical: 10,
  },
  downloadButtonText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  startButtonText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
});

export default SessionLoggingCard;
