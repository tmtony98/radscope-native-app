import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useState, useRef, useEffect } from "react";
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
  timeLimit?: number;
  timeInterval?: number;
  onTimeLimitChange?: (value: number) => void;
  onTimeIntervalChange?: (value: number) => void;
};

export const SessionLoggingwithDb = ({
  onStart = () => {}, //opens bottom sheet
  onDownload = () => {},
  onStopSuccess = () => {},
  isLogging = false,
  activeSessionId = null,
  timeLimit = 0,
  timeInterval = 1,
  onTimeLimitChange = () => {},
  onTimeIntervalChange = () => {},
}: SessionLoggingCardProps) => {
  const [displayTimeLimit, setDisplayTimeLimit] = useState(timeLimit);
  const [displayTimeInterval, setDisplayTimeInterval] = useState(timeInterval);

  const timeLimitRef = useRef(timeLimit);
  const timeIntervalRef = useRef(timeInterval);

  useEffect(() => {
    timeLimitRef.current = timeLimit;
    timeIntervalRef.current = timeInterval;
    setDisplayTimeLimit(timeLimit);
    setDisplayTimeInterval(timeInterval);
  }, [timeLimit, timeInterval]);

  const handleTimeLimitSliding = useCallback((value: number) => {
    timeLimitRef.current = value;
    setDisplayTimeLimit(value);
  }, []);

  const handleTimeLimitComplete = useCallback(() => {
    onTimeLimitChange(timeLimitRef.current);
  }, [onTimeLimitChange]);

  const handleIntervalSliding = useCallback((value: number) => {
    timeIntervalRef.current = value;
    setDisplayTimeInterval(value);
  }, []);

  const handleIntervalComplete = useCallback(() => {
    onTimeIntervalChange(timeIntervalRef.current);
  }, [onTimeIntervalChange]);

  const handleDownload = () => {
    router.push("/SessionView");
  };

  const handleStopSession = useCallback(async () => {
    if (!activeSessionId) {
      console.error("Cannot stop session: No active session ID found.");
      return;
    }
    console.log("Stopping session with ID:", activeSessionId);

    try {
      await database.write(async () => {
        console.log(
          "Inside database.write - preparing to update session:",
          activeSessionId
        );
        try {
          const sessionToStop = await database
            .get<Sessions>("sessions")
            .find(activeSessionId);
          console.log("Found session to stop:", sessionToStop.id);
          await sessionToStop.update((session) => {
            console.log("Inside update builder - setting stoppedAt");
            session.stoppedAt = new Date().getTime();
          });
          console.log("Session update successful.");
        } catch (findError) {
          console.error("Error finding session to stop:", findError);
          throw findError;
        }
      });
      console.log("Session stopped successfully.");
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
          Logging Time Limit (hrs): {displayTimeLimit}
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>1</Text>
          <Slider
            style={{ width: "85%", height: 40 }}
            minimumValue={1}
            maximumValue={24}
            step={1}
            value={timeLimit}
            onValueChange={handleTimeLimitSliding}
            onSlidingComplete={handleTimeLimitComplete}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.textSecondary}
            disabled={isLogging}
          />
          <Text style={TYPOGRAPHY.smallText}>24</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.smallText, { textAlign: "left" }]}>
          Logging Time Interval (s): {displayTimeInterval}
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.smallText}>1</Text>
          <Slider
            style={{ width: "85%", height: 40 }}
            minimumValue={1}
            maximumValue={60}
            step={1}
            value={timeInterval}
            onValueChange={handleIntervalSliding}
            onSlidingComplete={handleIntervalComplete}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.textSecondary}
            disabled={isLogging}
          />
          <Text style={TYPOGRAPHY.smallText}>60</Text>
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
  },
});

export default SessionLoggingwithDb;
