# React Native File System (RNFS) Documentation for Android

This documentation provides a step-by-step guide for implementing file system operations in React Native applications on Android, specifically focusing on:

1. Appending JSON data to JSONL files
2. Reading JSONL files line by line
3. Creating and organizing files in a date-based directory structure

## Table of Contents

1. [Setup and Installation](#setup-and-installation)
2. [Understanding Directory Paths](#understanding-directory-paths)
3. [Creating Date-Based Directory Structure](#creating-date-based-directory-structure)
4. [Appending JSON to JSONL Files](#appending-json-to-jsonl-files)
5. [Reading JSONL Files Line by Line](#reading-jsonl-files-line-by-line)
6. [Complete Implementation Example](#complete-implementation-example)

## Setup and Installation

First, install the react-native-fs package:

```bash
npm install react-native-fs --save
```

For React Native >= 0.60, the package is automatically linked. For older versions, you may need to run:

```bash
react-native link react-native-fs
```

Import the package in your JavaScript files:

```javascript
import RNFS from 'react-native-fs';
```

## Understanding Directory Paths

React Native File System provides several constants for common directory paths. For Android external storage, we'll use:

```javascript
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/radscope';
```

This creates a base path in the external storage directory with a folder named 'radscope'.

> **Note:** For Android 10 (API level 29) and above, you need to add appropriate permissions in your AndroidManifest.xml file:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

You'll also need to request these permissions at runtime:

```javascript
import { PermissionsAndroid } from 'react-native';

const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to your storage to save data files.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error("Error requesting storage permission:", err);
    return false;
  }
};
```

## Creating Date-Based Directory Structure

We'll organize our files in a Year/Month/Day structure. Here's a utility function to create the necessary directories:

```javascript
/**
 * Creates a directory path based on the current date or a specified date
 * @param {Date} date - Optional date object (defaults to current date)
 * @returns {Promise<string>} - The full path to the day directory
 */
const createDateBasedDirectory = async (date = new Date()) => {
  // Extract year, month, and day
  const year = date.getFullYear().toString();
  // Month is 0-indexed, so add 1 and pad with leading zero if needed
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // Create the full path
  const yearPath = `${BASE_PATH}/${year}`;
  const monthPath = `${yearPath}/${month}`;
  const dayPath = `${monthPath}/${day}`;
  
  try {
    // Check if directories exist, create them if they don't
    const yearExists = await RNFS.exists(yearPath);
    if (!yearExists) {
      await RNFS.mkdir(yearPath);
    }
    
    const monthExists = await RNFS.exists(monthPath);
    if (!monthExists) {
      await RNFS.mkdir(monthPath);
    }
    
    const dayExists = await RNFS.exists(dayPath);
    if (!dayExists) {
      await RNFS.mkdir(dayPath);
    }
    
    return dayPath;
  } catch (error) {
    console.error('Error creating date-based directory:', error);
    throw error;
  }
};
```

## Appending JSON to JSONL Files

JSONL (JSON Lines) format stores each JSON object on a separate line. Here's how to append JSON data to a JSONL file:

```javascript
/**
 * Appends a JSON object to a JSONL file
 * @param {Object} jsonData - The JSON data to append
 * @param {Date} date - Optional date object (defaults to current date)
 * @returns {Promise<void>}
 */
const appendJsonToFile = async (jsonData, date = new Date()) => {
  try {
    // Get the directory path for the current date
    const dirPath = await createDateBasedDirectory(date);
    
    // Create the file path - using the date as the filename
    const fileName = `data.jsonl`;
    const filePath = `${dirPath}/${fileName}`;
    
    // Convert JSON object to string and add a newline
    const jsonString = JSON.stringify(jsonData) + '\n';
    
    // Check if file exists
    const fileExists = await RNFS.exists(filePath);
    
    if (fileExists) {
      // Append to existing file
      await RNFS.appendFile(filePath, jsonString, 'utf8');
    } else {
      // Create new file
      await RNFS.writeFile(filePath, jsonString, 'utf8');
    }
    
    console.log('Successfully appended JSON data to file:', filePath);
  } catch (error) {
    console.error('Error appending JSON to file:', error);
    throw error;
  }
};
```

## Reading JSONL Files Line by Line

To read a JSONL file line by line and parse each line as JSON:

```javascript
/**
 * Reads a JSONL file and returns an array of parsed JSON objects
 * @param {Date} date - The date to read data for
 * @returns {Promise<Array>} - Array of parsed JSON objects
 */
const readJsonlFile = async (date = new Date()) => {
  try {
    // Get the directory path for the specified date
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const filePath = `${BASE_PATH}/${year}/${month}/${day}/data.jsonl`;
    
    // Check if file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      console.log('File does not exist:', filePath);
      return [];
    }
    
    const jsonObjects = [];
    let buffer = '';
    
    // Create a read stream for the file
    const readStream = await RNFS.read(filePath, 1024, 0, 'utf8');
    
    // Process the file in chunks
    for await (const chunk of readFileInChunks(filePath)) {
      buffer += chunk;
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';
      
      // Parse and add complete lines
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== '') {
          try {
            jsonObjects.push(JSON.parse(trimmedLine));
          } catch (parseError) {
            console.error('Error parsing JSON line:', parseError);
            // Continue processing other lines
          }
        }
      }
    }
    
    // Handle any remaining data in the buffer
    if (buffer.trim() !== '') {
      try {
        jsonObjects.push(JSON.parse(buffer.trim()));
      } catch (parseError) {
        console.error('Error parsing final JSON line:', parseError);
      }
    }
    
    return jsonObjects;
  } catch (error) {
    console.error('Error reading JSONL file:', error);
    throw error;
  }
};

/**
 * Generator function to read file in chunks
 * @param {string} filePath - Path to the file
 * @param {number} chunkSize - Size of each chunk in bytes
 */
async function* readFileInChunks(filePath, chunkSize = 1024 * 1024) {
  let position = 0;
  const fileSize = (await RNFS.stat(filePath)).size;
  
  while (position < fileSize) {
    const chunk = await RNFS.read(filePath, chunkSize, position, 'utf8');
    position += chunk.length;
    yield chunk;
  }
}
```

## Complete Implementation Example

Here's a complete example that demonstrates all the functionality:

```javascript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';

// Base path in external storage
const BASE_PATH = RNFS.ExternalStorageDirectoryPath + '/radscope';

// Request storage permissions
const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "App needs access to your storage to save data files.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error("Error requesting storage permission:", err);
    return false;
  }
};

// Initialize the base directory
const initializeDirectory = async () => {
  try {
    const exists = await RNFS.exists(BASE_PATH);
    if (!exists) {
      await RNFS.mkdir(BASE_PATH);
      console.log('Created base directory:', BASE_PATH);
    }
  } catch (error) {
    console.error('Error initializing directory:', error);
  }
};

// Create date-based directory structure
const createDateBasedDirectory = async (date = new Date()) => {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const yearPath = `${BASE_PATH}/${year}`;
  const monthPath = `${yearPath}/${month}`;
  const dayPath = `${monthPath}/${day}`;
  
  try {
    const yearExists = await RNFS.exists(yearPath);
    if (!yearExists) {
      await RNFS.mkdir(yearPath);
    }
    
    const monthExists = await RNFS.exists(monthPath);
    if (!monthExists) {
      await RNFS.mkdir(monthPath);
    }
    
    const dayExists = await RNFS.exists(dayPath);
    if (!dayExists) {
      await RNFS.mkdir(dayPath);
    }
    
    return dayPath;
  } catch (error) {
    console.error('Error creating date-based directory:', error);
    throw error;
  }
};

// Append JSON to JSONL file
const appendJsonToFile = async (jsonData, date = new Date()) => {
  try {
    const dirPath = await createDateBasedDirectory(date);
    const fileName = `data.jsonl`;
    const filePath = `${dirPath}/${fileName}`;
    
    // Convert JSON object to string and add a newline
    const jsonString = JSON.stringify(jsonData) + '\n';
    
    const fileExists = await RNFS.exists(filePath);
    
    if (fileExists) {
      await RNFS.appendFile(filePath, jsonString, 'utf8');
    } else {
      await RNFS.writeFile(filePath, jsonString, 'utf8');
    }
    
    console.log('Successfully appended JSON data to file:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error appending JSON to file:', error);
    throw error;
  }
};

// Read JSONL file line by line
const readJsonlFile = async (date = new Date()) => {
  try {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const filePath = `${BASE_PATH}/${year}/${month}/${day}/data.jsonl`;
    
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      console.log('File does not exist:', filePath);
      return [];
    }
    
    const fileContent = await RNFS.readFile(filePath, 'utf8');
    
    const jsonObjects = fileContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
    
    return jsonObjects;
  } catch (error) {
    console.error('Error reading JSONL file:', error);
    throw error;
  }
};

// Example component demonstrating the functionality
const FileSystemExample = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const [lastSavedPath, setLastSavedPath] = useState('');
  
  useEffect(() => {
    const setup = async () => {
      const granted = await requestStoragePermission();
      setHasPermission(granted);
      
      if (granted) {
        await initializeDirectory();
      }
    };
    
    setup();
  }, []);
  
  const handleSaveData = async () => {
    if (!hasPermission) {
      console.log('No storage permission');
      return;
    }
    
    try {
      // Example data similar to the format provided in requirements
      const timestamp = new Date().toISOString();
      const jsonData = {
        [timestamp]: {
          dose_rate: Math.random() * 0.5,
          cps: Math.floor(Math.random() * 200)
        }
      };
      
      const filePath = await appendJsonToFile(jsonData);
      setLastSavedPath(filePath);
      
      // Read back the data to display
      const data = await readJsonlFile();
      setSavedData(data);
    } catch (error) {
      console.error('Error in save operation:', error);
    }
  };
  
  const handleReadData = async () => {
    if (!hasPermission) {
      console.log('No storage permission');
      return;
    }
    
    try {
      const data = await readJsonlFile();
      setSavedData(data);
    } catch (error) {
      console.error('Error in read operation:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native File System Example</Text>
      
      {!hasPermission && (
        <Text style={styles.warning}>
          Storage permission not granted. Cannot access external storage.
        </Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button title="Save New Data" onPress={handleSaveData} disabled={!hasPermission} />
        <Button title="Read Saved Data" onPress={handleReadData} disabled={!hasPermission} />
      </View>
      
      {lastSavedPath !== '' && (
        <Text style={styles.path}>Last saved to: {lastSavedPath}</Text>
      )}
      
      <Text style={styles.subtitle}>Saved Data:</Text>
      <ScrollView style={styles.dataContainer}>
        {savedData.length > 0 ? (
          savedData.map((item, index) => (
            <Text key={index} style={styles.dataItem}>
              {JSON.stringify(item, null, 2)}
            </Text>
          ))
        ) : (
          <Text style={styles.emptyText}>No data found</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  warning: {
    color: 'red',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  path: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  dataContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
  },
  dataItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default FileSystemExample;
```

## Additional Tips and Best Practices

1. **Error Handling**: Always implement proper error handling when working with file system operations.

2. **Permissions**: Remember to request storage permissions at runtime for Android 6.0 (API level 23) and above.

3. **File Size Considerations**: When working with large JSONL files, consider reading the file in chunks rather than loading the entire file into memory.

4. **Backup Exclusion**: For sensitive or temporary data, consider excluding directories from automatic backups:

   ```javascript
   // iOS only
   RNFS.mkdir(dirPath, { NSURLIsExcludedFromBackupKey: true });
   ```

5. **Testing**: Test your file operations on different Android versions, as file system access has changed significantly in recent Android versions.

6. **Cleanup**: Implement a cleanup strategy for old data files to prevent excessive storage usage.

7. **Concurrency**: Be careful with concurrent file operations, especially when appending to the same file from different parts of your application.