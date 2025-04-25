import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback  , useState} from "react";
import {
  CARD_STYLE,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BUTTON_STYLE,
} from "../../Themes/theme";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import database from "@/index.native";
import Sessions from "@/model/Sessions";
import { red } from "react-native-reanimated/lib/typescript/Colors";
import { router } from "expo-router";


type SessionLoggingCardProps = {
  onDownload?: () => void;
  onStart?: () => void;
  onStopSuccess?: () => void;
  isLogging?: boolean;
  activeSessionId?: string | null;
 
};



export const SessionLoggingwithDb = ({
  // Default values are provided here to ensure that if the parent component does not supply these props,
  // the component will still function without throwing errors. For example, if onStart, onDownload, or onStopSuccess
  // are not passed, they default to no-op functions, preventing undefined function errors when called.
  // Similarly, isLogging and activeSessionId default to false and null, providing safe initial states.
  onStart = () => {},
  onDownload = () => {},
  onStopSuccess = () => {},
  isLogging = false,
  activeSessionId = null,
}: SessionLoggingCardProps) => {

// React.Dispatch<React.SetStateAction<string>>;


  const handleDownload = () => {
    router.push('/SessionView')
  };
  const handleStopSession = useCallback(async () => {
    if (!activeSessionId) {
      console.error("Cannot stop session: No active session ID found.");
      return;
    }
    console.log('Stopping session with ID:', activeSessionId);
  
    try {
      await database.write(async () => {
        console.log("Inside database.write - preparing to update session:", activeSessionId);
        try {
          const sessionToStop = await database.get<Sessions>('sessions').find(activeSessionId);
          console.log("Found session to stop:", sessionToStop.id);
          await sessionToStop.update(session => {
            console.log("Inside update builder - setting stoppedAt");
            session.stoppedAt = new Date().getTime();
          });
          console.log("Session update successful.");
        } catch (findError) {
          console.error("Error finding session to stop:", findError);
          // Re-throw or handle as appropriate for your app
          throw findError; 
        }
      });
      console.log('Session stopped successfully.');
      onStopSuccess();
     
    } catch (error) {
      console.error("Failed to stop session:", error);
    }
    
  }, [activeSessionId, onStopSuccess]);
  



  return (
    <View style={CARD_STYLE.container}>
      <Text style={TYPOGRAPHY.headLineSmall}>Session Logging</Text>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.smallText, { textAlign: "left" }]}>
          Logging Time Limit (hrs)
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>0</Text>
          <Slider
            style={{ width: "85%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
          />
          <Text style={TYPOGRAPHY.smallText}>100</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.smallText, { textAlign: "left" }]}>
          Logging Time Interval (s)
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>0</Text>
          <Slider
            style={{ width: "85%", height: 40 }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#000000"
            maximumTrackTintColor="#000000"
          />
          <Text style={TYPOGRAPHY.smallText}>100</Text>
        </View>
      </View>
      <View style={styles.loggingButtons}>
        <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
          <MaterialIcons name="visibility" size={24} color={COLORS.primary} />
          <Text style={styles.downloadButtonText}>View Log Files</Text>
        </TouchableOpacity>

        {isLogging ? (
          <TouchableOpacity
            style={[
              BUTTON_STYLE.mediumButtonWithIconLeft,
              { backgroundColor: "red" },
            ]}
            onPress={handleStopSession}
          >
            <MaterialIcons name="play-arrow" size={24} color={COLORS.white} />
            <Text style={styles.startButtonText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={BUTTON_STYLE.mediumButtonWithIconLeft}
            onPress={onStart}
          >
            <MaterialIcons name="play-arrow" size={24} color={COLORS.white} />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    marginVertical: SPACING.sm,
  },
  slider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  loggingButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "solid",
    paddingVertical: 10,
  },
  downloadButtonText: {
    color: COLORS.primary,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  startButtonText: {
    color: COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  stopButtonText: {
    color: COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginLeft: SPACING.sm,
    // backgroundColor: COLORS.error
  },
});

export default SessionLoggingwithDb;
