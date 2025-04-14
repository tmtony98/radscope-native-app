import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useCallback } from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

type SessionLoggingCardProps = {
  onDownload?: () => void;
  onStart?: () => void;
};

export const SessionLoggingCard = ({
  onDownload = () => {},
  onStart = () => {},
}: SessionLoggingCardProps) => {
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
        <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
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
