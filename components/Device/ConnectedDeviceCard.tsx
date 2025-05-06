import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  CARD_STYLE,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BUTTON_STYLE,
} from "../../Themes/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Device } from "./TopbarConnectTab";
import { useMqttContext } from "@/Provider/MqttContext";

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

  // get status
  const { status } = mqttContext;

  const handleViewDashboard = () => {
    router.push("/");
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
  };

  return (
    <>
      {connectedDevice ? (
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={[TYPOGRAPHY.headLineSmall, styles.headerText]}>
              Connected Devices
            </Text>
          </View>

          <View style={styles.cardContainer}>
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
                <Text style={styles.deviceIp}>{connectedDevice.host}</Text>
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
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.error}
                />

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
          </View>
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
    // paddingHorizontal: SPACING.md,
    // borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,

    paddingVertical: 12,
    paddingLeft: 16, // 24px padding left
    paddingRight: 16, // 30px padding right
    borderRadius: 10,
    borderStyle: "solid",
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
    // borderColor: COLORS.success,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  disconnectedBadge: {
    borderColor: COLORS.error,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
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
  disconnectButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  disconnectText: {
    color: COLORS.error,
    fontFamily: "Poppins-Medium",
    fontWeight: "700",
    fontSize: 16,
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
