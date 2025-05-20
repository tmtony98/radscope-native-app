import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from "react-native";
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
import Toast from 'react-native-toast-message';

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
  const [isTimeLimitSliding, setIsTimeLimitSliding] = useState(false);
  const [isTimeIntervalSliding, setIsTimeIntervalSliding] = useState(false);
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const timeLimitRef = useRef(timeLimit);
  const timeIntervalRef = useRef(timeInterval);

  useEffect(() => {
    timeLimitRef.current = timeLimit;
    timeIntervalRef.current = timeInterval;
    setDisplayTimeLimit(timeLimit);
    setDisplayTimeInterval(timeInterval);
  }, [timeLimit, timeInterval]);

  useEffect(() => {
    let pulseSequence: Animated.CompositeAnimation | undefined;
    
    if (isLogging) {
      pulseSequence = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnimation, {
            toValue: 0.9,
            duration: 800,
            useNativeDriver: true
          })
        ])
      );
      
      pulseSequence.start();
      Toast.show({
        type: 'success',
        text1: 'Session Started',
        text2: 'Your logging session has begun',
        position: 'bottom',
        visibilityTime: 3000
      });
    } else {
      pulseAnimation.setValue(1);
    }
    
    return () => {
      if (pulseSequence) {
        pulseSequence.stop();
      }
    };
  }, [isLogging, pulseAnimation]);

  const handleTimeLimitSliding = useCallback((value: number) => {
    timeLimitRef.current = value;
    setDisplayTimeLimit(value);
  }, []);

  const handleTimeLimitComplete = useCallback(() => {
    onTimeLimitChange(timeLimitRef.current);
    setIsTimeLimitSliding(false);
  }, [onTimeLimitChange]);

  const handleIntervalSliding = useCallback((value: number) => {
    timeIntervalRef.current = value;
    setDisplayTimeInterval(value);
  }, []);

  const handleIntervalComplete = useCallback(() => {
    onTimeIntervalChange(timeIntervalRef.current);
    setIsTimeIntervalSliding(false);
  }, [onTimeIntervalChange]);

  const handleDownload = () => {
    router.push("/SessionView");
  };

  const handleStopSession = useCallback(async () => {
    console.log("Stopping session with ID:", activeSessionId);

    try {
      console.log("Session stopped successfully.");
      onStopSuccess();
      Toast.show({
        type: 'success',
        text1: 'Session Stopped',
        text2: 'Your logging session has been stopped successfully',
        position: 'bottom',
        visibilityTime: 3000
      });
    } catch (error) {
      console.error("Failed to stop session:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to stop session',
        position: 'bottom',
        visibilityTime: 3000
      });
    }
  }, [onStopSuccess]);
  
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerContainer}>
        <Text style={[TYPOGRAPHY.headLineSmall, { marginBottom: 16 }]}>Session Logging</Text>
        {isLogging && (
          <View style={styles.loggingIndicatorContainer}>
            <Animated.View 
              style={[
                styles.pulseCircle,
                { transform: [{ scale: pulseAnimation }] }
              ]}
            />
            <Text style={styles.loggingText}>Recording...</Text>
          </View>
        )}
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.bodyTextLarge, { textAlign: "left" }]}>
          Logging Time Limit (hrs): {displayTimeLimit}
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>1</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.sliderControl}
              minimumValue={1}
              maximumValue={24}
              step={1}
              value={timeLimit}
              onValueChange={handleTimeLimitSliding}
              onSlidingStart={() => setIsTimeLimitSliding(true)}
              onSlidingComplete={handleTimeLimitComplete}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.textSecondary}
              thumbTintColor={COLORS.primary}
              disabled={isLogging}
            />
            {!isLogging && isTimeLimitSliding && (
              <View
                style={[
                  styles.valueIndicator,
                  {
                    left: `${((displayTimeLimit - 1) / 23) * 100}%`,
                    transform: [{ translateX: -20 }],
                  },
                ]}
              >
                <Text style={styles.valueIndicatorText}>{displayTimeLimit}</Text>
              </View>
            )}
          </View>
          <Text style={TYPOGRAPHY.bodyTextMedium}>24</Text>
        </View>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={[TYPOGRAPHY.bodyTextLarge, { textAlign: "left", }]}>
          Logging Time Interval (s): {displayTimeInterval}
        </Text>
        <View style={styles.slider}>
          <Text style={TYPOGRAPHY.bodyTextMedium}>1</Text>
          <View style={styles.sliderWrapper}>
            <Slider
              style={styles.sliderControl}
              minimumValue={1}
              maximumValue={600}
              step={1}
              value={timeInterval}
              onValueChange={handleIntervalSliding}
              onSlidingStart={() => setIsTimeIntervalSliding(true)}
              onSlidingComplete={handleIntervalComplete}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.textSecondary}
              thumbTintColor={COLORS.primary}
              disabled={isLogging}
            />
            {!isLogging && isTimeIntervalSliding && (
              <View
                style={[
                  styles.valueIndicator,
                  {
                    left: `${((displayTimeInterval - 1) / 599) * 100}%`,
                    transform: [{ translateX: -20 }],
                  },
                ]}
              >
                <Text style={styles.valueIndicatorText}>{displayTimeInterval}</Text>
              </View>
            )}
          </View>
          <Text style={TYPOGRAPHY.bodyTextMedium}>600</Text>
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
              { backgroundColor: COLORS.error , flex: 1,
                maxWidth: '48%', },
            ]}
            onPress={handleStopSession}
          >
            <MaterialIcons name="stop" size={24} color={COLORS.white} />
            <Text style={styles.startButtonText}>Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              BUTTON_STYLE.mediumButtonWithIconLeft,
              { backgroundColor: COLORS.primary , flex: 1,
                maxWidth: '48%', },
            ]}
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  loggingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: -12,
  },
  pulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    marginRight: 6,
  },
  loggingText: {
    fontSize: 12,
    color: COLORS.error,
    fontFamily: "Poppins-Medium",
  },
  sliderContainer: {
    marginVertical: SPACING.sm,
  },
  slider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  sliderWrapper: {
    width: "85%",
    height: 40,
    position: "relative",
    justifyContent: "center",
  },
  sliderControl: {
    width: "100%",
    height: 40,
  },
  thumbStyle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  trackStyle: {
    height: 8,
    borderRadius: 4,
  },
  valueIndicator: {
    position: "absolute",
    top: -20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  valueIndicatorText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
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
    flex: 1,
    maxWidth: '50%',
  },
  downloadButtonText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "500",
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

export default SessionLoggingCard;
