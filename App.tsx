import React, { useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import DeviceScanner from './components/Device/DeviceScanner';

// Simple Error Boundary using hooks
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>An error occurred:</Text>
        <Text style={{ marginTop: 10 }}>{error.message}</Text>
      </View>
    );
  }

  return (
    <React.Fragment>
      {React.Children.map(children, child => {
        try {
          return child;
        } catch (err) {
          setError(err as Error);
          return null;
        }
      })}
    </React.Fragment>
  );
};

const App = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectDevice = async (device: any) => {
    setIsConnecting(true);
    // Your connection logic here
    setIsConnecting(false);
  };

  return (
    <ErrorBoundary>
      <SafeAreaView>
        <DeviceScanner connectDevice={connectDevice} />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

export default App; 