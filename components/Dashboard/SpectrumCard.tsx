import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type SpectrumCardProps = {
  duration?: string;
  onFullscreen?: () => void;
};

export default function SpectrumCard({
  duration = '222 s',
  onFullscreen = () => {},
}: SpectrumCardProps) {
  const router = useRouter();
  
  const handleSettingsPress = () => {
    router.push('/(tabs)/settings');
  };
  
  return (
    <View style={CARD_STYLE.container}>
      <View style={styles.headerWithActions}>
        <Text style={TYPOGRAPHY.headLineSmall}>Spectrum</Text>
        <View style={styles.headerActions}>
          <Text style={TYPOGRAPHY.smallText}>{duration}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={onFullscreen}>
            <MaterialIcons name="fullscreen" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.chartPlaceholder}>
        <Text style={TYPOGRAPHY.bodyTextMedium}>Spectrum chart will be integrated here</Text>
      </View>
      <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
        <MaterialIcons name="settings" size={24} color={COLORS.primary} />
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWithActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    padding: SPACING.xs,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'solid',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  },
  settingsButtonText: {
    color: COLORS.primary,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
});
