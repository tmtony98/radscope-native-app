export interface Message {
    id: string;
    topic: string;
    payload: String;
    timestamp: Date;
  }
  
  export interface ConnectionStatus {
    connected: boolean;
    error?: string;
  }
  
  export interface GpsData {
    Fix: number;
    FixMode: number;
    Lat: number;
    Lon: number;
    Alt: number;
    Sat: number;
    Age: string;
    Time: string;
    Date: string;
    Speed: number;
    Course: number;
  }
  
  export interface BatteryData {
    SOC: number; // State of Charge, a percentage
    Voltage: number; // Voltage in volts
    ChargingCurrent: number; // Charging current in amperes
    StatusCharging: number; // Charging status (0 for not charging, 1 for charging)
    VoltageBUS: number; // BUS voltage in millivolts
    Temperature: number; // Temperature in degrees Celsius
  }
  