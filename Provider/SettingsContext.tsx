import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

export type generalSettings = {
  discoveryType: string;
  Alarm: number;
  serverCredentials: serverCredentials;
};

export type spectrumSettings = {
  energyAxis: string;
  scaleType: string;
  smoothingType: boolean;
  smoothingPoints: number;
};
export type serverCredentials = {
  IP_Address: string;
  port: number;
};

const general_Settings_Key = 'generalSettingsKey';
const spectrum_Settings_Key = 'spectrumSettingsKey';

// Define the context type
type SettingsContextType = {
  general_Settings_Key : string;
  spectrum_Settings_Key : string;
  generalSettings: generalSettings;
  spectrumSettings: spectrumSettings;
  storeGeneralSettings: (settings: generalSettings) => Promise<void>;
  storeSpectrumSettings: (settings: spectrumSettings) => Promise<void>;
  getGeneralSettings: (general_Settings_Key: string) => Promise<generalSettings>;
  getSpectrumSettings: (spectrum_Settings_Key: string) => Promise<spectrumSettings>;
};

// Create the context with the proper type
const SettingsContext = createContext<SettingsContextType>({
    general_Settings_Key: '',
    spectrum_Settings_Key: '',
    generalSettings: {
    discoveryType: 'Local',
    Alarm: 0,
    serverCredentials: {
      IP_Address: '',
      port: 0,
    },
  },
  spectrumSettings: {
    energyAxis: 'Energy Axis',
    scaleType: 'smoothy',
    smoothingType: false,
    smoothingPoints: 0,
  },
  storeGeneralSettings: async () => {},
  storeSpectrumSettings: async () => {},
  getGeneralSettings: async () => ({
    discoveryType: 'Local',
    Alarm: 0,
    serverCredentials: {
      IP_Address: '',
      port: 0,
    },
  }),
  getSpectrumSettings: async () => ({
    energyAxis: 'Energy Axis',
    scaleType: 'smoothy',
    smoothingType: false,
    smoothingPoints: 0,
  }),
});

// Create a custom hook to use the SettingsContext
export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

// Define props interface for the provider
interface SettingsProviderProps {
  children: React.ReactNode;
}

// Properly typed provider component
export function SettingsProvider({ children }: SettingsProviderProps) {
  // Function to store general settings in secure storage
  const storeGeneralSettings = async (settings: generalSettings) => {
    try {
      await SecureStore.setItemAsync(general_Settings_Key, JSON.stringify(settings));
      console.log('General settings stored successfully');
    } catch (error) {
      console.error('Failed to store general settings:', error);
    }
  };

  // Function to store spectrum settings in secure storage
  const storeSpectrumSettings = async (settings: spectrumSettings) => {
    try {
      await SecureStore.setItemAsync(spectrum_Settings_Key, JSON.stringify(settings));
      console.log('Spectrum settings stored successfully');
    } catch (error) {
      console.error('Failed to store spectrum settings:', error);
    }
  };

  // Helper function for default settings
  const getDefaultGeneralSettings = (): generalSettings => ({
    discoveryType: 'Local',
    Alarm: 0,
    serverCredentials: {
      IP_Address: '',
      port: 0,
    },
  });

  // Get the general settings from the secure store
  const getGeneralSettings = useCallback(async () => {
    try {
      const storedSettings = await SecureStore.getItemAsync(general_Settings_Key);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        console.log('General settings loaded successfully:', parsedSettings);
        return parsedSettings;
      } else {
        console.log('No general settings found, returning default values');
        return getDefaultGeneralSettings();
      }
    } catch (error) {
      console.error('Failed to load general settings:', error);
      return getDefaultGeneralSettings();
    }
  }, []);  // Empty dependency array since it doesn't depend on any props or state

  // Helper function for default settings
  const getDefaultSpectrumSettings = (): spectrumSettings => ({
    energyAxis: 'eV',
    scaleType: 'linear',
    smoothingType: false,
    smoothingPoints: 0,
  });

  // Get the spectrum settings from the secure store
  const getSpectrumSettings = async () => {
    try {
      const storedSettings = await SecureStore.getItemAsync(spectrum_Settings_Key);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        console.log('Spectrum settings loaded successfully:', parsedSettings);
        return parsedSettings;
      } else {
        console.log('No spectrum settings found, returning default values');
        return getDefaultSpectrumSettings();
      }
    } catch (error) {
      console.error('Failed to load spectrum settings:', error);
      return getDefaultSpectrumSettings();
    }
  };

  const loadSettings = async () => {
    const generalSettings = await getGeneralSettings();
    const spectrumSettings = await getSpectrumSettings();
    console.log('Loaded settings:', { generalSettings, spectrumSettings });
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const contextValue = useMemo(
    () => ({
        general_Settings_Key,
        spectrum_Settings_Key,
      generalSettings: {
        discoveryType: 'Local',
        Alarm: 0,
        serverCredentials: {
          IP_Address: '',
          port: 0,
        },
      },
      spectrumSettings: {
        energyAxis: 'Energy Axis',
        scaleType: 'smoothy',
        smoothingType: false,
        smoothingPoints: 0,
      },
      storeGeneralSettings,
      storeSpectrumSettings,
      getGeneralSettings,
      getSpectrumSettings,
    }),
    []
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

