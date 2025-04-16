import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import DeviceScanner from './components/Device/DeviceScanner';

const App = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectDevice = async (device: any) => {
    setIsConnecting(true);
    // Your connection logic here
    setIsConnecting(false);
  };

  return (
    <SafeAreaView>
      <DeviceScanner connectDevice={connectDevice} isConnecting={isConnecting} />
    </SafeAreaView>
  );
};

export default App; 