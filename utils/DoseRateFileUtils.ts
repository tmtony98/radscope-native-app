import RNFS from 'react-native-fs';

// Base path for all Radscope data
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/Radscope';
const DOSERATE_PATH = BASE_PATH + '/Doserate_data';

// Array of month names for directory structure
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to parse timestamps in various formats
const parseTimestamp = (timeStr: string): Date | null => {
  try {
    // Handle different timestamp formats
    if (!timeStr) return null;
    
    // Format: "YYYY-MM-DD HH:mm:ss" (local time)
    if (timeStr.includes('-') && timeStr.includes(':')) {
      const parts = timeStr.split(' ');
      if (parts.length !== 2) return null;
      
      const [datePart, timePart] = parts;
      
      if (!datePart || !timePart) return null;
      
      const dateComponents = datePart.split('-').map(Number);
      const timeComponents = timePart.split(':').map(Number);
      
      if (dateComponents.length !== 3 || timeComponents.length < 2) return null;
      
      const [year, month, day] = dateComponents;
      const [hours, minutes, seconds = 0] = timeComponents;
      
      if (isNaN(year) || isNaN(month) || isNaN(day) || 
          isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;
      }
      
      // Create a date object in local time
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
    // Fallback: try standard date parsing
    const fallbackDate = new Date(timeStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    
    return null;
  } catch (error) {
    console.warn("Error parsing timestamp:", timeStr, error);
    return null;
  }
};

/**
 * Interface for dose rate file information
 */
export interface DoseRateFile {
  name: string;
  path: string;
  date: Date;
  size: number;
}

/**
 * Interface for dose rate data point
 */
export interface DoseRateDataPoint {
  timestamp: string;
  doseRate: number;
  time_stamp: string;
}

/**
 * Get all dose rate files within a date range
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Promise with array of dose rate files
 */
export const getDoseRateFilesByDateRange = async (
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 7)), // Default to last 7 days
  endDate: Date = new Date()
): Promise<DoseRateFile[]> => {
  try {
    const doseRateFiles: DoseRateFile[] = [];
    // Clone dates to avoid modifying the original objects
    const currentDate = new Date(startDate.getTime());
    const endDateValue = new Date(endDate.getTime());
    
    // Set time to end of day for end date to include the full day
    endDateValue.setHours(23, 59, 59, 999);
    
    // Iterate through each day in the date range
    while (currentDate <= endDateValue) {
      const year = currentDate.getFullYear().toString();
      const month = MONTHS[currentDate.getMonth()];
      const day = currentDate.getDate().toString().padStart(2, '0');
      
      const dayPath = `${DOSERATE_PATH}/${year}/${month}/${day}`;
      
      // Check if the directory exists before trying to read it
      const dirExists = await RNFS.exists(dayPath);
      
      if (dirExists) {
        try {
          // Read all files in the directory
          const files = await RNFS.readDir(dayPath);
          
          // Filter for doserate.jsonl files and create DoseRateFile objects
          for (const file of files) {
            if (file.name === 'doserate.jsonl') {
              const fileStats = await RNFS.stat(file.path);
              
              doseRateFiles.push({
                name: file.name,
                path: file.path,
                date: new Date(currentDate.getTime()), // Clone the date
                size: fileStats.size
              });
            }
          }
        } catch (error) {
          console.warn(`Error reading directory ${dayPath}:`, error);
          // Continue to next date even if there's an error with this directory
        }
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Sort files by date (newest first)
    return doseRateFiles.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error getting dose rate files:', error);
    throw error;
  }
};

/**
 * Read the content of a dose rate file
 * @param filePath Path to the dose rate file
 * @returns Promise with the file content as an array of parsed JSON objects
 */
export const readDoseRateFile = async (filePath: string): Promise<DoseRateDataPoint[]> => {
  try {
    const content = await RNFS.readFile(filePath, 'utf8');
    console.log(`Reading file ${filePath}, content length: ${content.length}`);
    
    // Split by newlines and parse each line as JSON
    const lines = content.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    console.log(`Found ${lines.length} non-empty lines in the file`);
    
    // Sample the first line for debugging
    if (lines.length > 0) {
      console.log('Sample line:', lines[0]);
    }
    
    const dataPoints = lines.map((line, index) => {
      try {
        const parsedLine = JSON.parse(line);
        const timestamp = Object.keys(parsedLine)[0];
        const data = parsedLine[timestamp];
        
        // Validate the data structure
        if (!data || typeof data.doseRate !== 'number') {
          console.warn(`Invalid data structure at line ${index}:`, line);
          return null;
        }
        
        return {
          timestamp,
          doseRate: data.doseRate,
          time_stamp: data.time_stamp || timestamp // Fallback to timestamp if time_stamp is missing
        };
      } catch (parseError) {
        console.warn(`Error parsing JSON at line ${index}:`, parseError);
        return null;
      }
    }).filter(item => item !== null) as DoseRateDataPoint[];
    
    console.log(`Successfully parsed ${dataPoints.length} data points`);
    return dataPoints;
  } catch (error) {
    console.error(`Error reading dose rate file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Get dose rate data for a specific date and time range
 * @param date Date in format DD/MM/YYYY
 * @param startTime Start time in format HH:MM AM/PM
 * @param durationMinutes Duration in minutes to fetch data for (default: 10)
 * @returns Promise with array of dose rate data points
 */
export const getDoseRateDataByDateTime = async (
  date: string,
  startTime: string,
  durationMinutes: number = 10
): Promise<DoseRateDataPoint[]> => {
  try {
    console.log("Input date:", date, "startTime:", startTime, "durationMinutes:", durationMinutes);
    
    // Parse date
    const [day, month, year] = date.split('/').map(Number);
    console.log("Parsed date components:", day, month, year);
    
    // Parse time (handling AM/PM format)
    let [timePart, modifier] = startTime.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    console.log("Parsed time components:", hours, minutes, modifier);
    
    // Create date object for the selected date and time (in local time)
    const selectedDate = new Date(year, month - 1, day, hours, minutes);
    console.log("Selected date object (local):", selectedDate.toLocaleString());
    
    // Get the year, month, and day for the file path
    const fileYear = selectedDate.getFullYear().toString();
    const fileMonth = MONTHS[selectedDate.getMonth()];
    const fileDay = selectedDate.getDate().toString().padStart(2, '0');
    
    // Construct the file path
    const filePath = `${DOSERATE_PATH}/${fileYear}/${fileMonth}/${fileDay}/doserate.jsonl`;
    console.log("Looking for file at path:", filePath);
    
    // Check if the file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      console.warn(`Dose rate file not found: ${filePath}`);
      return [];
    }
    
    // Read the file content
    const allDataPoints = await readDoseRateFile(filePath);
    console.log("Total data points loaded:", allDataPoints.length);
    
    // Calculate the time range for filtering
    const startTimestamp = selectedDate.getTime();
    const endTimestamp = startTimestamp + (durationMinutes * 60 * 1000);
    
    console.log("Start timestamp (local):", startTimestamp, 
              "(", new Date(startTimestamp).toLocaleString(), ")");
    console.log("End timestamp (local):", endTimestamp, 
              "(", new Date(endTimestamp).toLocaleString(), ")");
    
    // Log a sample data point to check format
    if (allDataPoints.length > 0) {
      const sample = allDataPoints[0];
      console.log("Sample data point:", JSON.stringify(sample));
      console.log("Sample time_stamp format:", sample.time_stamp);
    }
    
    // Filter data points based on the time range
    // Since we're now storing timestamps in local time (ITC) format, we need to parse them accordingly
    
    console.log("Filtering data points between", new Date(startTimestamp).toLocaleString(), 
               "and", new Date(endTimestamp).toLocaleString());
    
    const filteredDataPoints = allDataPoints.filter(dataPoint => {
      // Get the timestamp to use (either time_stamp or timestamp field)
      const timeStr = dataPoint.time_stamp || dataPoint.timestamp;
      
      if (!timeStr) {
        console.warn("Missing timestamp in data point:", dataPoint);
        return false;
      }
      
      // Parse the timestamp
      const dataDate = parseTimestamp(timeStr);
      
      if (!dataDate) {
        return false; // Invalid timestamp
      }
      
      const dataTimestamp = dataDate.getTime();
      
      // Check if the data point is within our time range
      const isInRange = dataTimestamp >= startTimestamp && dataTimestamp <= endTimestamp;
      
      // Log some data points for debugging
      if (Math.random() < 0.01) { // Log ~1% of points
        console.log(
          "Data point check:", 
          timeStr,
          "→", 
          dataDate.toLocaleString(),
          "in range:", 
          isInRange
        );
      }
      
      return isInRange;
    });
    
    console.log("Filtered data points:", filteredDataPoints.length, 
              "out of", allDataPoints.length);
    
    // If no data points were found in the range, try a wider range for debugging
    if (filteredDataPoints.length === 0 && allDataPoints.length > 0) {
      console.log("No data points found in the specified range. Checking data range...");
      
      // Find the min and max timestamps in the data
      // Map timestamps and filter out null values
      const timestampsWithNulls = allDataPoints
        .map(dp => {
          try {
            // Parse the timestamp from the format "YYYY-MM-DD HH:mm:ss" (local time)
            const [datePart, timePart] = dp.time_stamp.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(Number);
            
            // Create a date object in local time
            const dataDate = new Date(year, month - 1, day, hours, minutes, seconds);
            return dataDate.getTime();
          } catch (e) {
            return null;
          }
        });
      
      // Filter out null values and assert the type as number[]
      const timestamps = timestampsWithNulls
        .filter((ts): ts is number => ts !== null && !isNaN(ts));
      
      if (timestamps.length > 0) {
        const minTimestamp = Math.min(...timestamps);
        const maxTimestamp = Math.max(...timestamps);
        
        console.log("Data time range (local):", 
                  new Date(minTimestamp).toLocaleString(), "to", 
                  new Date(maxTimestamp).toLocaleString());
        console.log("Selected time range (local):", 
                  new Date(startTimestamp).toLocaleString(), "to", 
                  new Date(endTimestamp).toLocaleString());
      }
    }
  
    // Sort by timestamp (oldest first)
    return filteredDataPoints.sort((a, b) => {
      try {
        const dateA = parseTimestamp(a.time_stamp);
        const dateB = parseTimestamp(b.time_stamp);
        
        if (!dateA || !dateB) return 0;
        
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.warn("Error sorting timestamps:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error('Error getting dose rate data by date and time:', error);
    throw error;
  }
};
