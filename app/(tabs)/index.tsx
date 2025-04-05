import { View, StyleSheet, Text } from "react-native";
import MDNSDeviceScanner from '../../components/MDNSDeviceScanner';
import App from "@/App";




export default function Index( route: any  | null) {
 
  
  return (
    <View style={styles.container}>
     <Text>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
