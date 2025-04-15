import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CARD_STYLE, COLORS, SPACING, TYPOGRAPHY, BUTTON_STYLE } from '../../Themes/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Device } from './TopbarConnectTab';

interface ConnectedDeviceCardProps {
  connectedDevice: Device;
  disconnectDevice: () => Promise<void>;
}

const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({ 
  connectedDevice, 
  disconnectDevice 
}) => {
  const router = useRouter();

  if (!connectedDevice) return null;

  const handleViewDashboard = () => {
    router.push('/');
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[TYPOGRAPHY.headLineSmall, styles.headerText]}>Connected Devices</Text>
        <View style={styles.connectedBadge}>
          <Text style={styles.connectedText}>1 Connected</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.deviceInfoContainer}>
          <View style={styles.deviceIconContainer}>
            <MaterialIcons name="devices" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.deviceDetails}>
            <Text style={[TYPOGRAPHY.TitleMedium, styles.deviceName]}>
              {connectedDevice.name || 'Device Name'}
            </Text>
            <Text style={styles.deviceIp}>{connectedDevice.host}</Text>
          </View>
          <TouchableOpacity 
            style={styles.disconnectButton} 
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.viewDashboardButton}
          onPress={handleViewDashboard}
        >
          <Text style={styles.viewDashboardText}>View Dashboard</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerText: {
    color: COLORS.text,
  },
  connectedBadge: {
    backgroundColor: '#166907',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  cardContainer: {
    ...CARD_STYLE.container,
    paddingVertical: SPACING.md,
    marginVertical: 0,
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    color: COLORS.text,
    fontSize: 16,
  },
  deviceIp: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  disconnectButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  disconnectText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
  viewDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  viewDashboardText: {
    color: COLORS.white,
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    marginRight: SPACING.xs,
  },
});

export default ConnectedDeviceCard; 