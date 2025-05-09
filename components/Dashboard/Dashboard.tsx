import { View, Text, ScrollView, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform, Alert, Linking, NativeModules } from 'react-native';
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import DoseRateCard from './DoseRateCard';
import DeviceDetailsCard from './DeviceDetailsCard';
import DoseRateGraph from './DoseRateGraph';
import SpectrumCard from './SpectrumCard';
import GPSCard from './GPSCard';
import SessionLoggingCard from './SessionLoggingCard';
import BatteryCard from './BatteryCard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BUTTON_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme'; // Removed unused CARD_STYLE
import StyledTextInput from '../common/StyledTextInput'; // Import the new component
import EnhancedDoseRateCard from '../../HOC/EnhancedDoseRateCard';
import database from '@/index.native';
import Sessions from '@/model/Sessions';
import  { SessionLoggingwithDb } from './SessionLoggingwithDb';
import { router } from 'expo-router';
import { useMqttContext } from '@/Provider/MqttContext';
import SessionData from '@/model/SessionData';
// import ManageExternalStorage from 'react-native-manage-external-storage';
import RNFS from 'react-native-fs';
import { Message } from '@/Types';




export default function Dashboard() {
  const [sessionName, setSessionName] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  // Add state for time limit and interval
  const [timeLimit, setTimeLimit] = useState<number>(0); // in hours
  const [timeInterval, setTimeInterval] = useState<number>(1); // in seconds, default 1 second
  
  // Refs for timers to be able to clear them
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeLimitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  //import msg from mqtt
  const { message } = useMqttContext();

  // Base path in external storage
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/radscope';

// Initialize the base directory
const initializeDirectory = async () => {
  try {
    const exists = await RNFS.exists(BASE_PATH);
    if (!exists) {
      await RNFS.mkdir(BASE_PATH);
      console.log('Created base directory:', BASE_PATH);
    }
  } catch (error) {
    console.error('Error initializing directory:', error);
  }
};

useEffect(() => {
  initializeDirectory();
}, []); // Initialize directory when component mounts

 

// Create date-based directory structure
const createDateBasedDirectory = async (date = new Date()) => {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const yearPath = `${BASE_PATH}/${year}`;
  const monthPath = `${yearPath}/${month}`;
  const dayPath = `${monthPath}/${day}`;
  
  try {
    const yearExists = await RNFS.exists(yearPath);
    if (!yearExists) {
      await RNFS.mkdir(yearPath);
    }
    
    const monthExists = await RNFS.exists(monthPath);
    if (!monthExists) {
      await RNFS.mkdir(monthPath);
    }
    
    const dayExists = await RNFS.exists(dayPath);
    if (!dayExists) {
      await RNFS.mkdir(dayPath);
    }
    
    return dayPath; // Return the path of the day directory eg: /radscope/2025/05/06
  } catch (error) {
    console.error('Error creating date-based directory:', error);
    throw error;
  }
};


// Remove this console.log that's outside the function
// console.log('Starting to append JSON data to file...', message);

// Replace the regular function with useCallback
const appendJsonToFile = useCallback(async (jsonData: Message, date = new Date()) => {
  // console.log('Starting to append JSON data to file...', jsonData);
  try {
    const dirPath = await createDateBasedDirectory(date);
    const fileName = `data.jsonl`;
    const filePath = `${dirPath}/${fileName}`;
    
    // Convert JSON object to string and add a newline
    const jsonString = JSON.stringify(jsonData) + '\n';
    
    const fileExists = await RNFS.exists(filePath);
    
    if (fileExists) {
      const result = await RNFS.appendFile(filePath, jsonString, 'utf8');
      console.log('Successfully appended JSON data to file:', filePath);
     
    } else {
      await RNFS.writeFile(filePath, jsonString, 'utf8');
    }
    
    console.log('Successfully appended JSON data to file:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error appending JSON to file:', error);
    throw error;
  }
}, [message]);

// Append JSON to JSONL file








  const [isExternalStorageAvailable, setIsExternalStorageAvailable] = useState(false);
  
  // useEffect for checking storage permission
  useEffect(() => {
    const AskPermission = async () => {
      try {
        console.log("Checking storage permission");
        const result = await NativeModules.PermissionFile.checkAndGrantPermission();
        console.log(result ? "Permission granted" : "Permission not granted yet");
        setIsExternalStorageAvailable(result);
      } catch (error) {
        console.error("Permission check failed:", error);
        setIsExternalStorageAvailable(false);
      }
    };
    
    AskPermission();  // This function is only executed once if the user allows the permission and this package retains that permission

  }, []);


  // Initialize file system and create test file
  // useEffect(() => {
  //   const initializeFileSystem = async () => {
  //     try {
  //       // Define base path for file storage
  //       const BASE_PATH = Platform.OS === 'android' 
  //         ? RNFS.ExternalStorageDirectoryPath + '/radscope' 
  //         : RNFS.DocumentDirectoryPath + '/radscope';
  //       console.log("Documents directory:", BASE_PATH);

  //       // Create directory if it doesn't exist
  //       await RNFS.mkdir(BASE_PATH);

  //       // Save a test file using async/await
  //       try {
  //         await RNFS.writeFile(
  //           `${BASE_PATH}/test.txt`,
  //           'This is a test file',
  //           'utf8'
  //         );
  //         console.log('Test file saved');
  //       } catch (err) {
  //         console.error('Error saving test file:', err);
  //       }
  //     } catch (error) {
  //       console.error('Error initializing file system:', error);
  //     }
  //   };

  //   // Execute the async function
  //   if (isExternalStorageAvailable) {
  //     initializeFileSystem();
  //   }
  // }, [isExternalStorageAvailable]);



  // Handler for time limit slider
  const handleTimeLimitChange = useCallback((value: number) => {
    setTimeLimit(value);
  }, []);

  // Handler for time interval slider
  const handleTimeIntervalChange = useCallback((value: number) => {
    setTimeInterval(value);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setSessionName('');
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const openSessionView = () => {
    router.push('/SessionView');
  };

  // Function to clear all timers
  const clearAllTimers = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
    
    if (timeLimitTimeoutRef.current) {
      clearTimeout(timeLimitTimeoutRef.current);
      timeLimitTimeoutRef.current = null;
    }
  }, []);

  // Handle stopping the session - clear timers and update state
  const handleStopSuccess = useCallback(() => {
    clearAllTimers();
    setIsLogging(false);
    setActiveSessionId("");
  }, [clearAllTimers]);

  const handleFullscreen = () => {
    console.log('Fullscreen pressed');
  };

  const handleGetHistory = () => {
    console.log('Get history pressed');
  };



//fn to create directory on external storage











  // Function to save current message data to database
  const saveSessionData = useCallback(async () => {
    if (!isLogging) {
      console.log('No active session or not logging');
      return;
    }
    
    console.log('Saving session data at interval, isLogging:', isLogging);
    try {
      await appendJsonToFile(message, new Date());
      console.log('All message data Session data saved successfully');
      
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }, [isLogging, message, appendJsonToFile]);

  // Add an effect to monitor isLogging changes and trigger initial data save when logging starts
  useEffect(() => {
    // console.log('isLogging state changed to:', isLogging);
    
    // When logging starts and we have an active session ID, save the initial data point
    if (isLogging && activeSessionId) {
      console.log('Logging started, saving initial data point');
      saveSessionData();
    }
  }, [isLogging, activeSessionId, saveSessionData]);

  // Initialize timers when session starts
  const setupTimers = useCallback((sessionId: string) => {
    // Convert time values to milliseconds
    const timeLimitMs = timeLimit * 60 * 60 * 1000; // hours to ms
    const timeIntervalMs = timeInterval * 1000; // seconds to ms
    
    // Setup interval for saving data
    if (timeIntervalMs > 0) {
      saveIntervalRef.current = setInterval(saveSessionData, timeIntervalMs);
      console.log(`Set up save interval: ${timeInterval} seconds`);
    }
    
    // Setup auto-stop timer if time limit > 0
    if (timeLimitMs > 0) {
      timeLimitTimeoutRef.current = setTimeout(async () => {
        console.log(`Time limit of ${timeLimit} hours reached, stopping session`);
        
        try {
          await database.write(async () => {
            const sessionToStop = await database.get<Sessions>('sessions').find(sessionId);
            await sessionToStop.update(session => {
              session.stoppedAt = new Date().getTime();
            });
          });
          
          handleStopSuccess();
        } catch (error) {
          console.error('Failed to auto-stop session:', error);
        }
      }, timeLimitMs);
      
      console.log(`Set up time limit: ${timeLimit} hours`);
    }
  }, [timeLimit, timeInterval, saveSessionData, handleStopSuccess]);

  const handleSaveSession = useCallback(async () => {
    console.log('Start logging pressed with session name:', sessionName);
    try {
      // Clear any existing timers
      clearAllTimers();
      
      // Start a new session
      const newSession = await database.write(async () => {
        console.log("Inside database.write - preparing to create...");
        const createdSession = await database.get('sessions').create((session: any) => {
          console.log("Inside create builder...");
          (session as Sessions).sessionName = sessionName;
          (session as Sessions).timeLimit = timeLimit;
          (session as Sessions).timeInterval = timeInterval;
          (session as Sessions).createdAt = new Date().getTime();
          (session as Sessions).stoppedAt = 0; // Initialize with 0
        });

        console.log("Session created:", createdSession);
        return createdSession;
      });
      
      console.log('Session saved, ID:', newSession.id);
      setActiveSessionId(newSession.id);
      
      // Set up timers for the new session
      setupTimers(newSession.id);
      
      // Set logging state to true AFTER creating the session
      // This will trigger the useEffect above which will save the initial data
      setIsLogging(true);
      
      closeBottomSheet();
    } catch (error) {
      console.error("Failed to save session:", error);
      setIsLogging(false);
    }
  }, [closeBottomSheet, sessionName, timeLimit, timeInterval, clearAllTimers, setupTimers]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return (
    <GestureHandlerRootView style={styles.rootView}> 
      <ScrollView style={styles.container}>
        <DeviceDetailsCard />
        <EnhancedDoseRateCard />
        <DoseRateGraph 
          onGetHistory={handleGetHistory}
        />
        <SpectrumCard 
          duration="222 s"
          onFullscreen={handleFullscreen}
        />
        <GPSCard />

        <SessionLoggingCard
          onDownload={openSessionView}
          onStart={openBottomSheet}
          onStopSuccess={handleStopSuccess}
          isLogging={isLogging}
          activeSessionId={activeSessionId}
          timeLimit={timeLimit}
          timeInterval={timeInterval}
          onTimeLimitChange={handleTimeLimitChange}
          onTimeIntervalChange={handleTimeIntervalChange}
        />

        <SessionLoggingwithDb
          onDownload={openSessionView}
          onStart={openBottomSheet}
          onStopSuccess={handleStopSuccess}
          isLogging={isLogging}
          activeSessionId={activeSessionId}
          timeLimit={timeLimit}
          timeInterval={timeInterval}
          onTimeLimitChange={handleTimeLimitChange}
          onTimeIntervalChange={handleTimeIntervalChange}
        />
        <BatteryCard 
          isLastCard={true}
        />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContentContainer}>
          <Text style={styles.bottomSheetTitle}>Add File Name</Text>
          <StyledTextInput
            label="Enter File Name"
            placeholder="Enter File Name"
            value={sessionName}
            onChangeText={setSessionName}
          />
          <View style={styles.bottomSheetButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={closeBottomSheet}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[BUTTON_STYLE.mediumButton, !sessionName && styles.disabledButton]} 
              onPress={handleSaveSession}
              disabled={!sessionName}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  rootView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.background,
  },
  bottomSheetContentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flex: 1,
  },
  bottomSheetTitle: {
    ...TYPOGRAPHY.headLineSmall,
    marginBottom: SPACING.md,
    textAlign: 'left',
    color: COLORS.text,
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  cancelButton: {
    ...BUTTON_STYLE.mediumButton,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    ...BUTTON_STYLE.mediumButtonText,
    color: COLORS.white,
  },
  saveButtonText: {
    ...BUTTON_STYLE.mediumButtonText,
  },
  disabledButton: {
    opacity: 0.5,
  },
});