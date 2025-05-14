import RNFS from 'react-native-fs';

// Base path for all Radscope data
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/Radscope';
const SESSION_PATH = BASE_PATH + '/Sessions_data';

// Array of month names for directory structure
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Interface for session file information
 */
interface SessionFile {
  name: string;
  path: string;
  date: Date;
  size: number;
}

/**
 * Get all session files within a date range
 * @param startDate Start date for filtering
 * @param endDate End date for filtering
 * @returns Promise with array of session files
 */
export const getSessionFilesByDateRange = async (
  startDate: Date = new Date(new Date().setDate(new Date().getDate() - 7)), // Default to last 7 days
  endDate: Date = new Date()
): Promise<SessionFile[]> => {
  try {
    const sessionFiles: SessionFile[] = [];
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
      
      const dayPath = `${SESSION_PATH}/${year}/${month}/${day}`;
      
      // Check if the directory exists before trying to read it
      const dirExists = await RNFS.exists(dayPath);
      
      if (dirExists) {
        try {
          // Read all files in the directory
          const files = await RNFS.readDir(dayPath);
          
          // Filter for .jsonl files and create SessionFile objects
          for (const file of files) {
            if (file.name.endsWith('.jsonl')) {
              const fileStats = await RNFS.stat(file.path);
              
              sessionFiles.push({
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
    return sessionFiles.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('Error getting session files:', error);
    throw error;
  }
};

/**
 * Read the content of a session file
 * @param filePath Path to the session file
 * @returns Promise with the file content as an array of parsed JSON objects
 */
export const readSessionFile = async (filePath: string): Promise<any[]> => {
  try {
    const content = await RNFS.readFile(filePath, 'utf8');
    
    // Split by newlines and parse each line as JSON
    return content
      .split('\n')
      .filter(line => line.trim() !== '') // Remove empty lines
      .map(line => JSON.parse(line));
  } catch (error) {
    console.error(`Error reading session file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Group session files by session name
 * @param files Array of session files
 * @returns Object with session names as keys and arrays of files as values
 */
export const groupSessionFilesByName = (files: SessionFile[]): Record<string, SessionFile[]> => {
  const grouped: Record<string, SessionFile[]> = {};
  
  files.forEach(file => {
    // Remove .jsonl extension to get session name
    const sessionName = file.name.replace('.jsonl', '');
    
    if (!grouped[sessionName]) {
      grouped[sessionName] = [];
    }
    
    grouped[sessionName].push(file);
  });
  
  return grouped;
};
