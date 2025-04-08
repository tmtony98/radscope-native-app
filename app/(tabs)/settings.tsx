import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, TYPOGRAPHY, CARD_STYLE, SPACING } from '../../Themes/theme';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import Header from '@/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  showChevron?: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  value,
  onToggle,
  onPress,
  showChevron = false,
}) => {
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleToggle = (newValue: boolean) => {
    if (onToggle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onToggle(newValue);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        pressed && { opacity: 0.7, backgroundColor: COLORS.border + '20' },
      ]}
      onPress={handlePress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <View style={styles.settingTextContainer}>
          <Text style={[TYPOGRAPHY.bodyTextLarge, { color: COLORS.text }]}>{title}</Text>
          {description && (
            <Text style={[TYPOGRAPHY.smallText, { color: COLORS.textSecondary, textAlign: 'left' }]}>
              {description}
            </Text>
          )}
        </View>
        {onToggle !== undefined && (
          <Switch
            value={value}
            onValueChange={handleToggle}
            trackColor={{ false: '#E9E9EA', true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        )}
        {showChevron && (
          <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        )}
      </View>
    </Pressable>
  );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={[TYPOGRAPHY.TitleMedium, styles.sectionTitle]}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [dataSync, setDataSync] = useState(true);
  const [batteryOptimization, setBatteryOptimization] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Settings" showBackButton={false} />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <SettingsSection title="Account">
            <SettingItem
              icon={<Ionicons name="person-outline" size={22} color={COLORS.primary} />}
              title="Profile"
              description="Manage your account information"
              onPress={() => console.log('Navigate to Profile')}
              showChevron
            />
            <SettingItem
              icon={<Ionicons name="notifications-outline" size={22} color={COLORS.primary} />}
              title="Notifications"
              description="Configure notification preferences"
              value={notifications}
              onToggle={setNotifications}
            />
          </SettingsSection>

          <SettingsSection title="Appearance">
            <SettingItem
              icon={<Ionicons name="moon-outline" size={22} color={COLORS.primary} />}
              title="Dark Mode"
              description="Switch between light and dark themes"
              value={darkMode}
              onToggle={setDarkMode}
            />
            <SettingItem
              icon={<Feather name="type" size={22} color={COLORS.primary} />}
              title="Text Size"
              description="Adjust the application text size"
              onPress={() => console.log('Navigate to Text Size')}
              showChevron
            />
          </SettingsSection>

          <SettingsSection title="Device">
            <SettingItem
              icon={<Ionicons name="location-outline" size={22} color={COLORS.primary} />}
              title="Location Services"
              description="Enable GPS location tracking"
              value={locationServices}
              onToggle={setLocationServices}
            />
            <SettingItem
              icon={<Ionicons name="sync-outline" size={22} color={COLORS.primary} />}
              title="Data Synchronization"
              description="Keep your data in sync across devices"
              value={dataSync}
              onToggle={setDataSync}
            />
            <SettingItem
              icon={<Ionicons name="battery-charging-outline" size={22} color={COLORS.primary} />}
              title="Battery Optimization"
              description="Optimize app performance for battery life"
              value={batteryOptimization}
              onToggle={setBatteryOptimization}
            />
          </SettingsSection>

          <SettingsSection title="Data Management">
            <SettingItem
              icon={<Ionicons name="cloud-upload-outline" size={22} color={COLORS.primary} />}
              title="Auto Backup"
              description="Automatically backup your data to the cloud"
              value={autoBackup}
              onToggle={setAutoBackup}
            />
            <SettingItem
              icon={<Ionicons name="trash-outline" size={22} color={COLORS.primary} />}
              title="Clear Cache"
              description="Free up space by clearing temporary files"
              onPress={() => console.log('Clear Cache')}
              showChevron
            />
          </SettingsSection>

          <SettingsSection title="Help & Support">
            <SettingItem
              icon={<Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />}
              title="Help Center"
              description="Get help with using the application"
              onPress={() => console.log('Navigate to Help Center')}
              showChevron
            />
            <SettingItem
              icon={<Ionicons name="document-text-outline" size={22} color={COLORS.primary} />}
              title="Terms & Privacy Policy"
              description="Review our terms and privacy policy"
              onPress={() => console.log('Navigate to Terms')}
              showChevron
            />
            <SettingItem
              icon={<Ionicons name="information-circle-outline" size={22} color={COLORS.primary} />}
              title="About"
              description="App version and information"
              onPress={() => console.log('Navigate to About')}
              showChevron
            />
          </SettingsSection>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Logout');
            }}
          >
            <Text style={[TYPOGRAPHY.TitleMedium, { color: COLORS.error }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'left',
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'solid',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderStyle: 'solid',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'solid',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderStyle: 'solid',
  },
});