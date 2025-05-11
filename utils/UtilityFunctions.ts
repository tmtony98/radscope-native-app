import { Message ,SensorData , SessionData , LiveData} from "@/Types";

export const extractDeviceId = (topic: string): string => {
  const parts = topic.split('/');
  return parts[parts.length - 1];
};

 const transformMqttMessageToSessionData = (message:Message): SessionData | null => {
  try {
    const parsedPayload = JSON.parse(message.payload);
    console.log("parsedPayload", parsedPayload);
    const deviceId = extractDeviceId(message.topic);
   
    const validData = acquisitionStatus(parsedPayload.data)
    console.log("validData", validData);
     if(validData){
      return {
        type: parsedPayload.type,
        device_id: deviceId,
        timestamp: parsedPayload.timestamp,
        Attributes: {
          ChargingCurrent: parsedPayload.data.Attributes.ChargingCurrent,
          StatusCharging: parsedPayload.data.Attributes.StatusCharging,
          VoltageBUS: parsedPayload.data.Attributes.VoltageBUS,
          Temperature: parsedPayload.data.Attributes.Temperature,
          SOC: parsedPayload.data.Attributes.SOC,
          Voltage: parsedPayload.data.Attributes.Voltage
        },
        GPS: {
          Fix: parsedPayload.data.GPS.Fix,
          FixMode: parsedPayload.data.GPS.FixMode,
          Lat: parsedPayload.data.GPS.Lat,
          Lon: parsedPayload.data.GPS.Lon,
          Alt: parsedPayload.data.GPS.Alt,
          Sat: parsedPayload.data.GPS.Sat,
          Age: parsedPayload.data.GPS.Age,
          Time: parsedPayload.data.GPS.Time,
          Date: parsedPayload.data.GPS.Date,
          Speed: parsedPayload.data.GPS.Speed,
          Course: parsedPayload.data.GPS.Course
        },
        Sensor: {
          doserate: {
            status: parsedPayload.data.Sensor.doserate.status,
            value: parsedPayload.data.Sensor.doserate.value,
            cps: parsedPayload.data.Sensor.doserate.cps,
            calib: parsedPayload.data.Sensor.doserate.calib
          },
          spectrum: {
            status: parsedPayload.data.Sensor.spectrum.status,
            len: parsedPayload.data.Sensor.spectrum.len,
            calib: parsedPayload.data.Sensor.spectrum.calib,
            acquisition_time: parsedPayload.data.Sensor.spectrum.acquisition_time,
            invalid_pulses: parsedPayload.data.Sensor.spectrum.invalid_pulses,
            cpu_load: parsedPayload.data.Sensor.spectrum.cpu_load,
            temperature: parsedPayload.data.Sensor.spectrum.temperature,
            bins: parsedPayload.data.Sensor.spectrum.bins
          }
        }
      }
     }else{
      return null
     }
  
  } catch (error) {
    console.error('Error parsing MQTT message payload:', error);
    throw new Error('Failed to parse MQTT message payload');
  }
};


const acquisitionStatus = (data: SessionData): boolean => {
  if (data.Sensor.doserate.status === 'Acquisition' || data.Sensor.spectrum.status === 'Acquisition') {
    return true;
  }else{
    return false;
  }
}


export default transformMqttMessageToSessionData;