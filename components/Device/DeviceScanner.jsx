import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import ScanningAnimation from "../ScanningAnimation";
import Zeroconf, { ImplType, Service } from "react-native-zeroconf";
import Button from "../Button";
import { useRouter } from "expo-router";
import { z } from "zod";
import { COLORS, TYPOGRAPHY, BUTTON_STYLE } from "@/Themes/theme";
import RippleLoader from "../common/RippleLoader";
import { MaterialIcons } from "@expo/vector-icons";
import { SPACING } from "@/Themes/theme";

const zeroconf = new Zeroconf();
const ip = z.string().ip();

// Add these helper functions outside the component
const stopScan = (zeroconfInstance, interval) => {
  if (!zeroconfInstance) {
    console.log("Zeroconf instance is null");
    return;
  }
  console.log("STOP SCAN called");

  // Clear interval if exists
  if (interval) {
    console.log("Clearing interval", interval);
    clearInterval(interval);
  }

  // Stop zeroconf
  try {
    console.log("Stopping zeroconf");
    zeroconfInstance.stop();
    zeroconfInstance.removeAllListeners();
    console.log("Zeroconf stopped and listeners removed");
  } catch (err) {
    console.error("Error stopping zeroconf:", err);
  }
};

const DeviceScanner = ({ connectDevice }) => {
  const [services, setServices] = useState([]);

  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buttonText, setButtonText] = useState("Start Scan");
  const [scanInterval, setScanInterval] = useState(null);

  const router = useRouter();

  // Create zeroconf instance ONCE

  const startDeviceScan = async () => {
    try {
      // clear the devices array
      setServices([]);

      // Remove any existing listeners before adding new ones
      console.log("Removing all existing listeners");
      zeroconf.removeAllListeners();

      // Set up event listeners
      zeroconf.on("start", () => {
        console.log("Scanning started");
        setIsScanning(true);
      });

      zeroconf.on("stop", () => {
        console.log("Scanning stopped by zeroconf");
        setIsScanning(false);
      });

      zeroconf.on("found", (service) => {
        console.log("Found service:", service);
      });

      zeroconf.on("resolved", (service) => {
        const ipv4 = z.string().ip({ version: "v4" });
        setServices((prev) =>
          ipv4.safeParse(service.host).success
            ? [
                ...prev.filter(
                  (s) =>
                    !(
                      s.name === service.name &&
                      s.host === service.host &&
                      s.port === service.port
                    )
                ),
                service,
              ]
            : prev
        );
        console.log("Resolved service:", service);
      });

      zeroconf.on("error", (err) => {
        console.error("Zeroconf error:", err);
        setError("Error during service discovery");
        setIsScanning(false);
      });

      // Start scanning
      console.log("Starting scan...");
      zeroconf.scan("spectrometer", "tcp", "local.");
      console.log("Scan started successfully");
    } catch (err) {
      console.error("Scan error:", err);
      setError("Failed to start scanning");
    }
  };

  // Cleanup on component unmount
  // useEffect(() => {
  //   if (Platform.OS === 'web') {
  //     setError('MDNS scanning is not supported on web platform');
  //   } else {
  //     deviceScan();
  //   }

  //   return () => {
  //     console.log("Component unmounting");
  //     stopScan(zeroconf, scanInterval);
  //   };
  // }, []);

  let stopTimer = null;

  const handleStopScan = () => {
    console.log("STOP called, current isRefreshing:", isRefreshing);
    console.log("Stopping scan");
    // Stop the current scan by calling stopScan and passing the current zeroconf instance and scanInterval.
    // This will clear the interval and stop the zeroconf instance.
    stopScan(zeroconf, scanInterval);

    //Update state
    setIsRefreshing(false);
    setButtonText("Start Scan");
    setIsScanning(false);

    // Clear the stop timer
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }
  };

  // Updated refresh function
  const handleStartScan = () => {
    console.log("REFRESH called, current isRefreshing:", isRefreshing);
    // Start scanning
    console.log("Starting scan");
    setIsRefreshing(true);
    setButtonText("Stop Scanning");

    // Start the initial scan
    stopScan(zeroconf, scanInterval);
    startDeviceScan();

    // stop the scan automatically after 10 seconds
    stopTimer = setTimeout(() => {
      console.log("Stopping scan after 10 seconds");
      stopScan(zeroconf, scanInterval);
      setIsRefreshing(false);
      setButtonText("Start Scan");
      setIsScanning(false);
    }, 10000);
  };

  const handleConnect = async (item) => {
    console.log("Connecting to:", item);
    // Stop the current scan by calling stopScan and passing the current zeroconf instance and scanInterval.
    handleStopScan();

    try {
      // Format the device to match our Device type in the context
      const device = {
        name: item.name || "Unknown Device",
        host: item.host || "",
        port: item.port || "",
        type: item.type || "",
        isConnected: true,
      };

      // Connect the device using our props
      await connectDevice(device);

      // Alert.alert(
      //   'Device Connected',
      //   `Successfully connected to ${item.name || 'Unknown Device'}`,
      //   [
      //     { text: 'OK' }
      //   ]
      // );
    } catch (error) {
      console.error("Failed to connect device:", error);
      Alert.alert(
        "Connection Failed",
        "There was an error connecting to the device. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Mock data for testing
  const mockServices = [
    { name: "Test Service 1", type: "http", host: "localhost", port: 8080 },
    { name: "Test Service 2", type: "http", host: "192.168.1.1", port: 3000 },
  ];

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        {isRefreshing ? (
          <Button
            title="Stop Scanning"
            onPress={handleStopScan}
            buttonStyle={{
              backgroundColor: "#ff4040",
            }}
          />
        ) : (
          <Button
            title="Start Scanning"
            onPress={handleStartScan}
            buttonStyle={{
              backgroundColor: "#31435E",
            }}
          />
        )}
      </View>

      {error ? (
        <View
          style={{ padding: 20, backgroundColor: "#ffebee", borderRadius: 5 }}
        >
          <Text style={{ color: "#c62828" }}>{error}</Text>
          {Platform.OS === "web" && (
            <Text style={{ marginTop: 10 }}>
              Try running this app on a native device or emulator.
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Always show the loader when refreshing/scanning */}
          {isRefreshing && (
            <View style={styles.loaderContainer}>
              <ScanningAnimation size={120} color={COLORS.primary} />
              {/* <RippleLoader size={75} color={COLORS.primary} /> */}
              {/* <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>
                Scanning for new devices...
              </Text> */}
            </View>
          )}

          {/* Header for devices section */}
          {!isRefreshing && (
            <Text style={styles.sectionHeader}>Available Devices</Text>
          )}

          {/* Use FlatList as the main scrollable container */}
          <FlatList
            data={Platform.OS === "web" ? mockServices : services}
            keyExtractor={(item, index) => `${item.name || "Unknown"}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.deviceItem}>
                <View style={styles.deviceIconContainer}>
                  <Text>
                    <MaterialIcons
                      name="router"
                      size={24}
                      color={COLORS.primary}
                    />
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceName}>
                    {item.name || "Unknown"}
                  </Text>
                  <Text>Host: {item.host || "N/A"}</Text>
                  <Text>Port: {item.port || "N/A"}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <Button title="Connect" onPress={() => handleConnect(item)} />
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>
                {isScanning ? "" : "No devices found"}
              </Text>
            )}
            ListHeaderComponent={() => (
              <View style={{ marginBottom: isRefreshing ? 0 : 10 }} />
            )}
            contentContainerStyle={styles.flatListContent}
            style={styles.flatList}
          />
        </View>
      )}
    </View>
  );
};

export default DeviceScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  deviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F9FC",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  deviceItem: {
    padding: 14,
    marginVertical: 5,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BDC5D1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deviceName: {
    fontWeight: "bold",
    flexWrap: "wrap",
    width: "100%",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyListText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  buttonContainer: {
    marginTop: 10,
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  devicesContainer: {
    flex: 1,
  },
  refreshingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    alignItems: "center",
  },
});
