import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Platform , Pressable , StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Zeroconf from 'react-native-zeroconf';
import Button from '../Button';
import { useNavigation } from '@react-navigation/native';


// Add these helper functions outside the component
const stopScan = (zeroconfInstance, interval) => {
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

const DeviceScanner = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buttonText, setButtonText] = useState("Start Scan");
  const [scanInterval, setScanInterval] = useState(null);

  const navigation = useNavigation();

  // Create zeroconf instance ONCE
  const zeroconfRef = React.useRef(new Zeroconf());

  const deviceScan = () => {
    try {
      // Remove any existing listeners before adding new ones
      console.log("Removing all existing listeners");
      zeroconfRef.current.removeAllListeners();
      
      // Set up event listeners
      zeroconfRef.current.on('start', () => {
        console.log('Scanning started');
        setIsScanning(true);
      });

      zeroconfRef.current.on('stop', () => {
        console.log('Scanning stopped by zeroconf');
        setIsScanning(false);
      });

      zeroconfRef.current.on('found', service => {
        console.log('Found service:', service);
      
      });

      zeroconfRef.current.on('resolved', service => {
        console.log('Resolved service:', service);
        setServices(prev => [...prev, service]);
      });

      zeroconfRef.current.on('error', err => {
        console.error('Zeroconf error:', err);
        setError('Error during service discovery');
        setIsScanning(false);
      });

      // Start scanning
      console.log('Starting scan...');
      zeroconfRef.current.scan();
      console.log('Scan started successfully');
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to start scanning');
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    if (Platform.OS === 'web') {
      setError('MDNS scanning is not supported on web platform');
    } else {
      deviceScan();
    }
    
    return () => {
      console.log("Component unmounting");
      stopScan(zeroconfRef.current, scanInterval);
    };
  }, []);

  // Updated refresh function
  const reFresh = () => {
    console.log("REFRESH called, current isRefreshing:", isRefreshing);
    if (isRefreshing) {
      // Stop scanning
      console.log("Stopping scan");
      stopScan(zeroconfRef.current, scanInterval);
      
      // Update state
      setIsRefreshing(false);
      setButtonText("Start Scan");
      setIsScanning(false);
    } else {
      // Start scanning
      console.log("Starting scan");
      setIsRefreshing(true);
      setButtonText("Stop Scanning");
      
      // Start the initial scan
      deviceScan();
      
      // Set up interval for continuous scanning
      const interval = setInterval(() => {
        console.log("Interval triggered, running deviceScan()");
        deviceScan();
      }, 4000);
      console.log("Interval " , interval);
      
      setScanInterval(interval);
      console.log("Set scan interval:", interval);
    }
  };

  const handleConnect = (item) => {
    console.log('Connecting to:', item);
    Alert.alert(
      'Device Connected',
      `Successfully connected to ${item.name || 'Unknown Device'}`,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ]
    );
    navigation.navigate('(tabs)', { screen: 'index'  })
  };
  // Mock data for testing
  const mockServices = [
    { name: 'Test Service 1', type: 'http', host: 'localhost', port: 8080 },
    { name: 'Test Service 2', type: 'http', host: '192.168.1.1', port: 3000 }
  ];

  const uniqueServices = services.filter((service, index, self) =>
    index === self.findIndex((s) => (
      s.name === service.name &&
      s.host === service.host &&
      s.port === service.port
    ))
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 }}>
        <Button
          title={buttonText}
          onPress={() => {
            console.log("Button pressed, current state:", isRefreshing);
            reFresh();
          }}
          buttonStyle={{ 
            backgroundColor: isRefreshing ? '#ff4040' : '#31435E' 
          }}
        />
      </View>
      
      {error ? (
        <View style={{ padding: 20, backgroundColor: '#ffebee', borderRadius: 5 }}>
          <Text style={{ color: '#c62828' }}>{error}</Text>
          {Platform.OS === 'web' && (
            <Text style={{ marginTop: 10 }}>
              Try running this app on a native device or emulator.
            </Text>
          )}
        </View>
      ) : (
        <>
          {/* Always show the loader when refreshing/scanning */}
          {isRefreshing && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.refreshingText}>Scanning for new devices...</Text>
            </View>
          )}
          
          {/* Always show discovered devices section */}
          <View style={styles.devicesContainer}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              {isScanning && !isRefreshing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>Scanning </Text>
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              ) : (
                'Discovered Devices'
              )}
            </Text>
            
            <FlatList
              data={Platform.OS === 'web' ? mockServices : uniqueServices}
              keyExtractor={(item, index) => `${item.name || 'Unknown'}-${index}`}
              renderItem={({ item }) => (
                <View style={{
                  padding: 14,
                  marginVertical: 5,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 12,
                  borderWidth: 1, // Add 1px border
                 borderColor: '#BDC5D1', // Set border col
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{item.name || 'Unknown'}</Text>
                    <Text>Type: {item.type || 'N/A'}</Text>
                    <Text>Host: {item.host || 'N/A'}</Text>
                    <Text>Port: {item.port || 'N/A'}</Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button
                      title="Connect"
                      onPress={() => handleConnect(item)}
                    />
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                  {isScanning ? 'Searching for services...' : 'No devices found'}
                </Text>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

export default DeviceScanner;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  refreshingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    color: '#333',
  },
  devicesContainer: {
    flex: 1,
  },
  refreshingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    alignItems: 'center',
  }
});