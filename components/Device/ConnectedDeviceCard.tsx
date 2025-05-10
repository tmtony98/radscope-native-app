import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import {
  CARD_STYLE,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BUTTON_STYLE,
} from "../../Themes/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Device } from "./TopbarConnectTab";
import { useMqttContext } from "@/Provider/MqttContext";
import { useDeviceContext } from "@/Provider/DeviceContext";
import Toast from 'react-native-toast-message';


interface ConnectedDeviceCardProps {
  connectedDevice: Device | null;
  disconnectDevice: () => Promise<void>;
}

const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({
  connectedDevice,
  disconnectDevice,
}) => {
  const router = useRouter();
  const mqttContext = useMqttContext();
  const deviceContext = useDeviceContext();
  const { connectedDevice: device } = deviceContext;

  // get status
  const { status } = mqttContext;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  const handleViewDashboard = () => {
    // Add a slight delay for better visual effect
    setTimeout(() => {
      router.push("/");
    }, 100);
  };

  useEffect(() => {
    if (status.connected) {
      // Show toast immediately
      Toast.show({
        type: 'success',
        text1: 'Device Connected Successfully',
        text2: `Successfully connected to ${connectedDevice?.name || "Device"}`,
        visibilityTime: 3000,
        position: 'bottom',
      });

      // Navigate after 1 second
      const navigationTimer = setTimeout(() => {
        router.push('/');
      }, 1500);

      // Cleanup timer on unmount
      return () => clearTimeout(navigationTimer);
    }
  }, [status.connected, connectedDevice?.name, router]);

  const handleDisconnect = async () => {
    await disconnectDevice();
    Toast.show({
      type: 'error',
      text1: 'Device Disconnected',
      text2: `Successfully Disconnected ${connectedDevice?.name || "Device"}`,
      visibilityTime: 3000,
      position: 'bottom',
    });
  };

  return (
    <>
      {connectedDevice ? (
        <View style={styles.container}>
          <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
            <View style={styles.deviceInfoContainer}>
              <View style={styles.deviceIconContainer}>
                <MaterialIcons
                  name="devices"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.deviceDetails}>
                <Text style={[TYPOGRAPHY.TitleMedium, styles.deviceName]}>
                  {connectedDevice.name || "Device Name"}
                </Text>

                <Text style={styles.deviceIp}>
                  IP Address: {connectedDevice.host}
                </Text>
                <Text style={styles.deviceIp}>
                  Port: {connectedDevice.port}
                </Text>
              </View>
              {status.connected ? (
                <View style={styles.connectedBadge}>
                  <Text style={styles.connectedText}> Connected</Text>
                </View>
              ) : (
                <>
                  <View style={styles.disconnectedBadge}>
                    <Text style={styles.disconnectedText}>Disconnected</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={handleDisconnect}
              >
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={BUTTON_STYLE.mediumButtonWithIconLeft}
                onPress={handleViewDashboard}
              >
                <Text style={styles.viewDashboardText}>View Dashboard</Text>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingLeft: 16, // 24px padding left
    paddingRight: 16, // 30px padding right
    borderRadius: 10,
    borderStyle: "solid",
  },
  disconnectText: {
    color: COLORS.white,
    fontFamily: "Poppins-Medium",
    fontWeight: "600",
    fontSize: 16,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  headerText: {
    color: COLORS.text,
  },
  connectedBadge: {
    borderColor: COLORS.success,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
    borderRadius: 12,
  },
  disconnectedBadge: {
    borderColor: COLORS.error,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 1,
    borderRadius: 12,
    color: COLORS.error,
  },
  disconnectedText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  connectedText: {
    color: COLORS.success,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  cardContainer: {
    ...CARD_STYLE.container,
    paddingVertical: SPACING.md,
    marginVertical: 0,
  },
  deviceInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F9FC",
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Poppins-Regular",
  },

  viewDashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  viewDashboardText: {
    color: COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginRight: SPACING.xs,
  },
});

export default ConnectedDeviceCard;
