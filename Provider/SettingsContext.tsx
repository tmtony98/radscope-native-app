import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

// Use consistent naming conventions (camelCase)
export type GeneralSettings = {
  discoveryType: string;
  alarm: number | null
  serverCredentials: ServerCredentials | null;
};

export type SpectrumSettings = {
  energyAxis: string;
  scaleType: string;
  smoothingType: boolean;
  smoothingPoints: number;
};

export type ServerCredentials = {
  ipAddress: string | null;
  port: number | null;
};

// Storage keys
const GENERAL_SETTINGS_KEY = 'generalSettingsKey';
const SPECTRUM_SETTINGS_KEY = 'spectrumSettingsKey';

// Default settings
const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  discoveryType: 'Local',
  alarm: 10,
  serverCredentials: {
    ipAddress: '',
    port: 0,
  },
};

const DEFAULT_SPECTRUM_SETTINGS: SpectrumSettings = {
  energyAxis: 'Energy Axis',
  scaleType: 'Linear',
  smoothingType: false,
  smoothingPoints: 0,
};

// Define the context type
type SettingsContextType = {
  generalSettingsKey: string;
  spectrumSettingsKey: string;
  generalSettings: GeneralSettings;
  spectrumSettings: SpectrumSettings;
  storeGeneralSettings: (settings: GeneralSettings) => Promise<void>;
  storeSpectrumSettings: (settings: SpectrumSettings) => Promise<void>;
  getGeneralSettings: () => Promise<GeneralSettings>;
  getSpectrumSettings: () => Promise<SpectrumSettings>;
};

// Create the context with default values
const SettingsContext = createContext<SettingsContextType>({
  generalSettingsKey: GENERAL_SETTINGS_KEY,
  spectrumSettingsKey: SPECTRUM_SETTINGS_KEY,
  generalSettings: DEFAULT_GENERAL_SETTINGS,
  spectrumSettings: DEFAULT_SPECTRUM_SETTINGS,
  storeGeneralSettings: async () => {},
  storeSpectrumSettings: async () => {},
  getGeneralSettings: async () => DEFAULT_GENERAL_SETTINGS,
  getSpectrumSettings: async () => DEFAULT_SPECTRUM_SETTINGS,
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

// Provider component
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  // State to store settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(DEFAULT_GENERAL_SETTINGS);
  const [spectrumSettings, setSpectrumSettings] = useState<SpectrumSettings>(DEFAULT_SPECTRUM_SETTINGS);
  
  // Function to store general settings in secure storage
  const storeGeneralSettings = useCallback(async (settings: GeneralSettings) => {
    try {
      await SecureStore.setItemAsync(GENERAL_SETTINGS_KEY, JSON.stringify(settings));
      setGeneralSettings(settings);
      console.log('General settings stored successfully');
    } catch (error) {
      console.error('Failed to store general settings:', error);
    }
  }, []);

  // Function to store spectrum settings in secure storage
  const storeSpectrumSettings = useCallback(async (settings: SpectrumSettings) => {
    try {
      await SecureStore.setItemAsync(SPECTRUM_SETTINGS_KEY, JSON.stringify(settings));
      setSpectrumSettings(settings);
      console.log('Spectrum settings stored successfully' , settings);

      debugger
    } catch (error) {
      console.error('Failed to store spectrum settings:', error);
    }
  }, []);

  // Get the general settings from the secure store
  const getGeneralSettings = useCallback(async () => {
    try {
      const storedSettings = await SecureStore.getItemAsync(GENERAL_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as GeneralSettings;
        setGeneralSettings(parsedSettings);
        return parsedSettings;
      }
      return DEFAULT_GENERAL_SETTINGS;
    } catch (error) {
      console.error('Failed to load general settings:', error);
      return DEFAULT_GENERAL_SETTINGS;
    }
  }, []);

  // Get the spectrum settings from the secure store
  const getSpectrumSettings = useCallback(async () => {
    try {
      const storedSettings = await SecureStore.getItemAsync(SPECTRUM_SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as SpectrumSettings;
        setSpectrumSettings(parsedSettings);
        return parsedSettings;
      }
      return DEFAULT_SPECTRUM_SETTINGS;
    } catch (error) {
      console.error('Failed to load spectrum settings:', error);
      return DEFAULT_SPECTRUM_SETTINGS;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      await Promise.all([
        getGeneralSettings(),
        getSpectrumSettings()
      ]);
    };
    loadSettings();
  }, [getGeneralSettings, getSpectrumSettings]);

  // Create memoized context value
  const contextValue = useMemo(() => ({
    generalSettingsKey: GENERAL_SETTINGS_KEY,
    spectrumSettingsKey: SPECTRUM_SETTINGS_KEY,
    generalSettings,
    spectrumSettings,
    storeGeneralSettings,
    storeSpectrumSettings,
    getGeneralSettings,
    getSpectrumSettings,
  }), [
    generalSettings,
    spectrumSettings,
    storeGeneralSettings,
    storeSpectrumSettings,
    getGeneralSettings,
    getSpectrumSettings
  ]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

