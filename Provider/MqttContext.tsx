import React, { createContext, useContext } from 'react';
import useMqtt from '../Hooks/useMqtt';
import { Message, ConnectionStatus } from '../Types';

// Define types for context
type MqttContextType = {
  messages: Message[];
  status: ConnectionStatus;
  doseRate: number;
};

// Create context with default values
const MqttContext = createContext<MqttContextType>({
  messages: [],
  status: { connected: false },
  doseRate: 0
});

// Provider component that wraps the app
export function MqttProvider({ children }: { children: React.ReactNode }) {
  // Use the hook once here
  const mqttData = useMqtt();
  
  return (
    <MqttContext.Provider value={mqttData}>
      {children}
    </MqttContext.Provider>
  );
}

// Custom hook to access the context
export const useMqttContext = () => useContext(MqttContext); 