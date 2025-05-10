export interface Message {
    id: string;
    topic: string;
    payload: string;
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
  
  export interface DoseRateData {
    status: string;
    value: number;
    cps: number;
    calib: number[];
  }

  export interface SpectrumData {
    status: string;
    len: number;
    calib: number[];
    acquisition_time: number;
    invalid_pulses: number;
    cpu_load: number;
    temperature: number;
    bins: number[];
  }

  export interface SensorData {
    doserate: DoseRateData;
    spectrum: SpectrumData;
  }

  export interface LiveData {
    type: string;
    data: {
      GPS: GpsData;
      Attributes: BatteryData;
      Sensor: SensorData;
    };
    timestamp: string;
  }

export interface SessionData {
    type: string;
    device_id: string;
    timestamp: string;
    Attributes: {
      ChargingCurrent: number;
      StatusCharging: number;
      VoltageBUS: number;
      Temperature: number;
      SOC: number;
      Voltage: number;
    };
    GPS: {
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
    };
    Sensor: {
      doserate: {
        status: string;
        value: number;
        cps: number;
        calib: number[];
      };
      spectrum: {
        status: string;
        len: number;
        calib: number[];
        acquisition_time: number;
        invalid_pulses: number;
        cpu_load: number;
        temperature: number;
        bins: number[];
      };
    };
  }

  export interface DoserateData {
    [timestamp: string]: {
      doseRate: number;
      time_stamp: string;
    }
  }
  