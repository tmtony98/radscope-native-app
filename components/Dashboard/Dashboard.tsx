import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useRef, useCallback, useMemo } from 'react';
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
    paddingVertical: SPACING.lg,
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
    paddingBottom: SPACING.sm

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
});

export default function Dashboard() {
  const [sessionName, setSessionName] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

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

  const handleSaveSession = useCallback(async () => {
    console.log('Start logging pressed with session name:', sessionName);
    closeBottomSheet();
  }, [closeBottomSheet, sessionName]);

  const handleFullscreen = () => {
    console.log('Fullscreen pressed');
  };

  const handleGetHistory = () => {
    console.log('Get history pressed');
  };

  const handleDownload = () => {
    console.log('Download files pressed');
  };

  return (
    <GestureHandlerRootView style={styles.rootView}> 
      <ScrollView style={styles.container}>
        <DeviceDetailsCard />
        <DoseRateCard />
        <DoseRateGraph 
          onGetHistory={handleGetHistory}
        />
        <SpectrumCard 
          duration="222 s"
          onFullscreen={handleFullscreen}
        />
        <GPSCard />
        <SessionLoggingCard 
          onDownload={handleDownload}
          onStart={openBottomSheet}
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
            <TouchableOpacity style={BUTTON_STYLE.mediumButton} onPress={handleSaveSession}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}