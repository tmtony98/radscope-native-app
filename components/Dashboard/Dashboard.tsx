import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
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



export default function Dashboard() {
  const [sessionName, setSessionName] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>(" ");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const { message } = useMqttContext();

  console.log('messagessss', message)



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
    router.push('/SessionView')
  };

  const handleStopSuccess = useCallback(() => {
    setIsLogging(false);
    setActiveSessionId("");
  }, []);

  const handleFullscreen = () => {
    console.log('Fullscreen pressed');
  };

  const handleGetHistory = () => {
    console.log('Get history pressed');
  };


  const handleSaveSession = useCallback( async () => {
    console.log('Start logging pressed with session name:', sessionName);
    try {
      // Wrap the create operation in database.write
      setIsLogging(true);
      const newSession = await database.write(async () => {
        console.log("Inside database.write - preparing to create...");
        const createdSession = await database.get('sessions').create((session: any) => {
          console.log("Inside create builder...");
          (session as Sessions).sessionName = sessionName;
          (session as Sessions).createdAt = new Date().getTime();
        });

        console.log("Inside database.write - create finished, returning.");
        console.log("createdSession", createdSession);
        return createdSession;
      });
      
      console.log('newSession saved:', newSession.id);
      setActiveSessionId(newSession.id);
      setIsLogging(true);
      closeBottomSheet();
    } catch (error) {
      console.error("Failed to save session:", error);
      console.log("Error:", error);
      
    }
    console.log("isLogging" , isLogging);
    
  }, [closeBottomSheet, sessionName]);

  // useEffect to save message data when logging is active
  useEffect(() => {
    // Guard clause: Only proceed if logging, we have a session ID, and a message exists
    if (!isLogging || !activeSessionId || !message) {
      return;
    }
    // Define async function for the database write operation
    const writeData = async () => {
      console.log('Attempting to save SessionData for message:', message);
      try {
        await database.write(async () => {
          await database.get<SessionData>('sessionData').create(entry => {
            entry.sessionId = activeSessionId; // Use the active session ID
            entry.data = message;             // Save the current message
            // The 'timestamp' field with @date should be set automatically by WatermelonDB on creation
          });
        });
        console.log('SessionData saved successfully for message:', message);
      } catch (error) {
        console.error('Failed to save SessionData:', error);
        // Optional: Handle error, e.g., set an error state, show a notification
      }
    };

    // Execute the write operation
    writeData();

  }, [message, isLogging, activeSessionId]); // Dependencies: Re-run when message, isLogging, or activeSessionId changes

  return (
    <GestureHandlerRootView style={styles.rootView}> 
      <ScrollView style={styles.container}>
        <DeviceDetailsCard />
        <EnhancedDoseRateCard />
        {/* <DoseRateCard /> */}
        <DoseRateGraph 
          onGetHistory={handleGetHistory}
        />
        <SpectrumCard 
          duration="222 s"
          onFullscreen={handleFullscreen}
        />
        <GPSCard />

        <SessionLoggingwithDb
          onDownload={openSessionView}
          onStart={openBottomSheet}
          onStopSuccess={handleStopSuccess}
          isLogging={isLogging}
          activeSessionId={activeSessionId}
        />
          {/* <SessionLoggingCard 
            onDownload={handleDownload}
            onStart={openBottomSheet}
          /> */}
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
    paddingHorizontal: SPACING.md, // Use theme spacing
  },
  rootView: {
    flex: 1,
    backgroundColor: COLORS.background, // Use background color from theme
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
    textAlign: 'left', // Align title left
    color: COLORS.text,
  },
  bottomSheetButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    // flex: 1,
    

  },
  cancelButton: {
    ...BUTTON_STYLE.mediumButton, // Use spread syntax
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,

    // borderColor: COLORS.primary,
    // borderWidth: 1,
  },
  cancelButtonText: {
    ...BUTTON_STYLE.mediumButtonText, // Use spread syntax
    color: COLORS.white,
  },
  saveButtonText: {
     ...BUTTON_STYLE.mediumButtonText,
    
   },
   disabledButton: {
    opacity: 0.5, // Style for the disabled button
   },
  
});