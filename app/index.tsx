import { View, StyleSheet } from "react-native";
import MDNSDeviceScanner from '../components/MDNSDeviceScanner';
import App from "@/App";

export default function Index() {
  return (
    <View style={styles.container}>
      <MDNSDeviceScanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
