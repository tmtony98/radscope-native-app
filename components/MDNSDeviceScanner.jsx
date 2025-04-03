import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Platform } from 'react-native';
import Zeroconf from 'react-native-zeroconf';

const MDNSDeviceScanner = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    console.log("isScanning", isScanning);
    
    if (Platform.OS === 'web') {
      setError('MDNS scanning is not supported on web platform');
    
    }

    // Create instance outside of async function
    const zeroconf = new Zeroconf();
    console.log('zeroconf', zeroconf);
    if (!zeroconf) {
      console.error('Zeroconf initialization failed');
      return;
    }
    try {
      // Set up event listeners
      zeroconf.on('start', () => {
        console.log('Scanning started');
        setIsScanning(true);
        console.log("isScanning", isScanning);
      });

      zeroconf.on('stop', () => {
        console.log('Scanning stopped');
        setIsScanning(false);
      });

      zeroconf.on('found', service => {
        console.log('Found service:', service);
      });

      zeroconf.on('resolved', service => {
        console.log('Resolved service:', service);
        setServices(prev => [...prev, service]);
      });

      zeroconf.on('error', err => {
        console.error('Zeroconf error:', err);
        setError('Error during service discovery');
        setIsScanning(false);
      });

      // Start scanning with a small delay to ensure listeners are set up
      setTimeout(() => {
        try {
          console.log('Starting scan...');
          zeroconf.scan();
          console.log('Scan started successfully');
        } catch (err) {
          console.error('Scan error:', err);
          setError('Failed to start scanning');
        }
      }, 1000);

    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize service discovery');
    }

    // Cleanup
    return () => {
      try {
        zeroconf.stop();
        zeroconf.removeAllListeners();
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    };
  }, []);

  // Mock data for testing
  const mockServices = [
    { name: 'Test Service 1', type: 'http', host: 'localhost', port: 8080 },
    { name: 'Test Service 2', type: 'http', host: '192.168.1.1', port: 3000 }
  ];

  return (
    <View style={{ flex: 1, padding: 20 }}>
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
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            {isScanning ? 'Scanning for Services...' : 'Discovered Services'}
          </Text>
          <FlatList
            data={Platform.OS === 'web' ? mockServices : services}
            keyExtractor={(item, index) => item.name || `service-${index}`}
            renderItem={({ item }) => (
              <View style={{
                padding: 15,
                marginVertical: 5,
                backgroundColor: '#f5f5f5',
                borderRadius: 8,
                elevation: 1,
              }}>
                <Text style={{ fontWeight: 'bold' }}>Name: {item.name || 'Unknown'}</Text>
                <Text>Type: {item.type || 'N/A'}</Text>
                <Text>Host: {item.host || 'N/A'}</Text>
                <Text>Port: {item.port || 'N/A'}</Text>
              </View>
            )}
            ListEmptyComponent={() => (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                {isScanning ? 'Searching for services...' : 'No services found'}
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
};

export default MDNSDeviceScanner;