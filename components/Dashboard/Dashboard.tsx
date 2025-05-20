import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
  NativeModules,
  BackHandler,
} from "react-native";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import DoseRateCard from "./DoseRateCard";
import DeviceDetailsCard from "./DeviceDetailsCard";
import DoseRateGraph from "./DoseRateGraph";
import SpectrumCard from "./SpectrumCard";
import GPSCard from "./GPSCard";
import BatteryCard from "./BatteryCard";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BUTTON_STYLE, COLORS, SPACING, TYPOGRAPHY } from "../../Themes/theme"; // Removed unused CARD_STYLE
import StyledTextInput from "../common/StyledTextInput"; // Import the new component
import EnhancedDoseRateCard from "../../HOC/EnhancedDoseRateCard";
import database from "@/index.native";
import Sessions from "@/model/Sessions";
import { SessionLoggingCard } from "./SessionLoggingCard";
import { router } from "expo-router";
import { useMqttContext } from "@/Provider/MqttContext";
import SessionData from "@/model/SessionData";
// import ManageExternalStorage from 'react-native-manage-external-storage';
import RNFS from "react-native-fs";
import { Message } from "@/Types";
import {
  transformMqttMessageToSessionData,
  getDataTime,
} from "@/utils/UtilityFunctions";

export default function Dashboard() {
  const [sessionName, setSessionName] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  // Add state for time limit and interval
  const [timeLimit, setTimeLimit] = useState<number>(1); // in hours
  const [timeInterval, setTimeInterval] = useState<number>(30); // in seconds, default 1 second

  console.log("timeLimit", timeLimit, "timeInterval", timeInterval);
  console.log("isLogging", isLogging);

  // Refs for timers to be able to clear them
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeLimitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeSessionNameRef = useRef<string>("");

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["40%"], []);

  //import msg from mqtt
  const { message, createDateBasedDirectory , isExternalStorageAvailable } = useMqttContext();




 

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
      setSessionName("");
    }
  }, []);

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const openSessionView = () => {
    router.push("/SessionView");
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
    // Clear the active session name ref when stopping
    activeSessionNameRef.current = "";
  }, [clearAllTimers]);

  const handleFullscreen = () => {
    console.log("Fullscreen pressed");
  };

  const handleGetHistory = () => {
    console.log("Get history pressed");
  };

  //fn to create directory on external storage

  // Initialize timers when session starts
  const setupTimers = useCallback(
    (sessionId: string) => {
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
          console.log(
            `Time limit of ${timeLimit} hours reached, stopping session`
          );

          try {
            await database.write(async () => {
              const sessionToStop = await database
                .get<Sessions>("sessions")
                .find(sessionId);
              await sessionToStop.update((session) => {
                session.stoppedAt = new Date().getTime();
              });
            });

            handleStopSuccess();
          } catch (error) {
            console.error("Failed to auto-stop session:", error);
          }
        }, timeLimitMs);

        console.log(`Set up time limit: ${timeLimit} hours`);
      }
    },
    [timeLimit, timeInterval, handleStopSuccess]
  );

  const handleSaveSession = useCallback(async () => {
    console.log("Start logging pressed with session name:", sessionName);
    try {
      activeSessionNameRef.current = sessionName;
      console.log("Stored session name in ref:", activeSessionNameRef.current);
      setIsLogging(true);
      closeBottomSheet();
    } catch (error) {
      console.error("Failed to save session file name:", error);
      setIsLogging(false);
    }
  }, [
    closeBottomSheet,
    sessionName,
   
  ]);

  // Add an effect to monitor isLogging changes and trigger initial data save when logging starts
  useEffect(() => {
    console.log("isLogging state changed to:", isLogging);
    // When logging starts and we have an active session ID, save the initial data point
    if (isLogging) {
      // let lastDataTime
      // console.log("messageeeee", message);
      // console.log("Logging started, saving initial data point");
      // saveSessionData();
    }
  }, [isLogging]);

  const lastDataTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLogging) return; 
    // console.log("Setting up logging timeout...");
    setTimeout(() => {
      setIsLogging(false);
      // console.log("Logging stopped automatically after timeout");
    }, timeLimit * 60 * 60 * 1000 );
  }, [isLogging]);




  useEffect(() => {
    if (!isLogging) {
      return;
    } 
    // Use ref 
    const currentDataTime = getDataTime(message);
    if (currentDataTime === null) {
      // console.log("Could not extract timestamp from message");
      return;
    }
    
    // Initialize lastDataTimeRef if it's not set yet
    if (lastDataTimeRef.current === null) {
      lastDataTimeRef.current = currentDataTime;
      // Save the first data point immediately
      saveSessionData();
      console.log("Initialized lastDataTime:", lastDataTimeRef.current);
      return;
    }
    if (currentDataTime >= lastDataTimeRef.current + timeInterval) { //eg 10s>=10s+10s will true when 20=20
      // console.log(`Time interval reached: ${timeInterval}s passed since last data point`);
      // Update the last data time to current time
      lastDataTimeRef.current = currentDataTime;
      // Save the data
      saveSessionData();
    } else {
      console.log(`Not enough time passed: ${currentDataTime - lastDataTimeRef.current}s of ${timeInterval}s interval`);
    }
  }, [message, isLogging, timeInterval]);

  const saveSessionData = useCallback(async () => {
    if (!isLogging || !message) {
      // console.log("No active session, not logging, or no message available");
      return;
    }

    // console.log('Saving session data at interval, isLogging:', isLogging);
    try {
      const data = transformMqttMessageToSessionData(message);
      if (data === null) {
        console.warn("Skipping file write - transformed data is null");
        return;
      }

      // Use the active session name from the ref, which persists throughout the session
      // Fall back to sessionName state, then to a default if both are empty
      const currentSessionName =
        activeSessionNameRef.current || sessionName || "unnamed_session";

      const date = new Date();
      const dirPath = await createDateBasedDirectory(date, "session");
      // console.log("Directory path:", dirPath);
      // console.log("Using session name:", currentSessionName);

      const fileName = `${currentSessionName}.jsonl`;
      const filePath = `${dirPath}/${fileName}`;
      // console.log("File path for saving:", filePath);

      // Convert JSON object to string and add a newline
      const jsonString = JSON.stringify(data) + "\n";
      // console.log("JSON string to append:", jsonString);

      const fileExists = await RNFS.exists(filePath);
      // console.log("File exists:", fileExists);

      if (fileExists) {
        await RNFS.appendFile(filePath, jsonString, "utf8");
        // console.log("Successfully appended JSON data to file:", filePath);
      } else {
        await RNFS.writeFile(filePath, jsonString, "utf8");
        // console.log("File does not exist, created new file:", filePath);
      }

      // console.log("All message data Session data saved successfully");
    } catch (error) {
      // console.error("Failed to save session data:", error);
    }
  }, [isLogging, message, createDateBasedDirectory, sessionName]);

  //Clean up timers when component unmounts
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
        <DoseRateGraph onGetHistory={handleGetHistory} />
        <SpectrumCard duration="222 s" onFullscreen={handleFullscreen} />
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

        <BatteryCard isLastCard={true} />
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
          <Text style={styles.bottomSheetTitle}>Enter File Name</Text>
          <StyledTextInput
            label="Enter File Name"
            placeholder="Enter File Name"
            value={sessionName}
            onChangeText={setSessionName}
          />
          <View style={styles.bottomSheetButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeBottomSheet}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                BUTTON_STYLE.mediumButton,
                !sessionName && styles.disabledButton,
              ]}
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
    width: "100%",
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
    textAlign: "left",
    color: COLORS.text,
  },
  bottomSheetButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
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
