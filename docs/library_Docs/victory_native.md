# Victory Native Charts for React Native: Visualizing Time-Series Data

## 1. Introduction

Victory Native is a powerful charting library for React Native applications that leverages React Native Skia for high-performance rendering. This guide focuses on implementing interactive line charts to visualize time-series data, specifically for tracking doseRate measurements in microsieverts (µSv) over time.

### What You'll Learn

- Setting up Victory Native in a React Native application
- Creating basic line charts for time-series data
- Implementing zoom and pan functionality for data exploration
- Adding interactive features like tooltips
- Optimizing performance for large datasets
- Handling real-time data updates
- Customizing charts for specific requirements

Victory Native is particularly well-suited for scientific and monitoring applications that require displaying sensor data over time. Its Skia-based rendering provides smooth performance even with large datasets, while its gesture handling capabilities enable intuitive data exploration.

## 2. Installation & Setup

### Required Dependencies

Victory Native relies on several peer dependencies to function properly:

```bash
# Install peer dependencies
yarn add react-native-reanimated react-native-gesture-handler @shopify/react-native-skia

# Install Victory Native
yarn add victory-native
```

### Configuration

Add the Reanimated plugin to your `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    // other plugins...
  ],
};
```

### Project Structure

For a typical implementation, your project structure might look like this:

```
src/
  ├── components/
  │   ├── charts/
  │   │   ├── BasicLineChart.tsx
  │   │   ├── InteractiveLineChart.tsx
  │   │   └── TimeSeriesChart.tsx
  │   └── ...
  ├── screens/
  │   └── DataVisualizationScreen.tsx
  ├── utils/
  │   └── dataFormatters.ts
  └── ...
assets/
  └── fonts/
      └── inter-medium.ttf
```

### Basic Imports

Here are the essential imports you'll need for most chart implementations:

```javascript
// Core components
import { CartesianChart, Line } from "victory-native";

// For interactive features
import { useChartPressState, useChartTransformState } from "victory-native";

// For custom rendering
import { Circle, Text, useFont } from "@shopify/react-native-skia";

// For animations
import { SharedValue } from "react-native-reanimated";
```

## 3. Basic Line Chart Implementation

Let's start with a basic line chart implementation to display doseRate data over time.

### Component Structure

```javascript
import React from "react";
import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import inter from "../assets/fonts/inter-medium.ttf"; // Font for labels

function BasicDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Sample doseRate data (µSv over time)
  const DATA = Array.from({ length: 31 }, (_, i) => ({
    timestamp: i, // This would be actual timestamps in a real app
    doseRate: 0.5 + 2 * Math.random(), // Random values between 0.5 and 2.5 µSv
  }));

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={DATA}
        xKey="timestamp"
        yKeys={["doseRate"]}
        axisOptions={{ font }}
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="blue" 
            strokeWidth={2}
            curveType="natural" // Smooths the line
          />
        )}
      </CartesianChart>
    </View>
  );
}

export default BasicDoseRateChart;
```

### Key Components Explained

#### CartesianChart

The `CartesianChart` component is the foundation of your visualization:

- **data**: Array of objects containing your data points
- **xKey**: The property name for x-axis values (e.g., "timestamp")
- **yKeys**: Array of property names for y-axis values (e.g., ["doseRate"])
- **axisOptions**: Configuration for axes, including fonts and styling
- **children**: Render function that receives transformed data for drawing

#### Line Component

The `Line` component renders the actual line chart:

- **points**: Array of points to draw the line through (provided by CartesianChart)
- **color**: Line color
- **strokeWidth**: Line thickness
- **curveType**: Type of curve to use (linear, natural, cardinal, etc.)

### Basic Customization

You can customize the appearance of your chart with additional props:

```javascript
<CartesianChart
  data={DATA}
  xKey="timestamp"
  yKeys={["doseRate"]}
  axisOptions={{ 
    font,
    lineWidth: 1,
    lineColor: "#CCCCCC",
    labelColor: "#333333",
  }}
  // Control chart margins
  padding={{ left: 40, top: 20, right: 20, bottom: 40 }}
  // Set explicit domain bounds (optional)
  domain={{ x: [0, 30], y: [0, 3] }}
  // Add padding between data and axes
  domainPadding={{ x: 10, y: 10 }}
>
  {({ points }) => (
    <Line 
      points={points.doseRate} 
      color="#1E88E5" 
      strokeWidth={2}
      curveType="natural"
    />
  )}
</CartesianChart>
```

## 4. Time-Series Data Visualization

For doseRate monitoring, you'll typically work with actual timestamps rather than sequential numbers. Let's adapt our chart for proper time-series visualization.

### Formatting Time Data

```javascript
import React from "react";
import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { format } from "date-fns"; // For date formatting
import inter from "../assets/fonts/inter-medium.ttf";

function TimeSeriesDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Generate sample time-series data with actual timestamps
  const DATA = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      timestamp: date.getTime(), // Unix timestamp
      doseRate: 0.5 + 2 * Math.random(), // Random values between 0.5 and 2.5 µSv
    };
  });

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={DATA}
        xKey="timestamp"
        yKeys={["doseRate"]}
        // Custom axis configuration
        xAxis={{
          font,
          // Format timestamps as dates
          formatXLabel: (value) => format(new Date(value), "MM/dd"),
          labelRotate: 45, // Rotate labels for better fit
          tickCount: 6, // Limit number of ticks for readability
        }}
        yAxis={[{
          font,
          // Format y-axis values with units
          formatYLabel: (value) => `${value.toFixed(2)} µSv`,
          tickCount: 5,
        }]}
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="#1E88E5" 
            strokeWidth={2}
            curveType="natural"
          />
        )}
      </CartesianChart>
    </View>
  );
}

export default TimeSeriesDoseRateChart;
### Handling Different Time Ranges

For different time ranges, you can adjust the date formatting:

```javascript
// For hourly data
formatXLabel: (value) => format(new Date(value), "HH:mm")

// For daily data
formatXLabel: (value) => format(new Date(value), "MM/dd")

// For monthly data
formatXLabel: (value) => format(new Date(value), "MMM yyyy")
```

### Choosing the Right Curve Type

Different curve types can better represent different kinds of time-series data:

- **linear**: Best for precise readings where exact values matter
- **natural**: Good for showing general trends with smoothing
- **step**: Useful for data that changes in discrete steps
- **monotoneX**: Preserves monotonicity in the x direction (good for time series)

```javascript
// For precise scientific readings
<Line points={points.doseRate} curveType="linear" />

// For trend visualization
<Line points={points.doseRate} curveType="natural" />

// For stepped changes
<Line points={points.doseRate} curveType="step" />
```

## 5. Zoom and Pan Functionality

For time-series data exploration, zoom and pan functionality is essential. Let's implement these features:

### Basic Zoom and Pan Implementation

```javascript
import React from "react";
import { View } from "react-native";
import { CartesianChart, Line, useChartTransformState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import inter from "../assets/fonts/inter-medium.ttf";

function ZoomableDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Sample time-series data
  const DATA = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      timestamp: date.getTime(),
      doseRate: 0.5 + 2 * Math.random(),
    };
  });

  // Create transform state for pan/zoom functionality
  const transformState = useChartTransformState({
    scaleX: 1.0, // Initial X-axis scale
    scaleY: 1.0, // Initial Y-axis scale
  });

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={DATA}
        xKey="timestamp"
        yKeys={["doseRate"]}
        xAxis={{
          font,
          formatXLabel: (value) => format(new Date(value), "MM/dd"),
          labelRotate: 45,
        }}
        yAxis={[{
          font,
          formatYLabel: (value) => `${value.toFixed(2)} µSv`,
        }]}
        // Enable pan/zoom with the transform state
        transformState={transformState}
        // Configure pan/zoom behavior
        transformConfig={{
          pan: {
            enabled: true,
            dimensions: ["x", "y"], // Allow panning in both dimensions
          },
          pinch: {
            enabled: true,
            dimensions: ["x"], // Only allow zooming in x dimension (time)
          }
        }}
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="#1E88E5" 
            strokeWidth={2}
            curveType="natural"
          />
        )}
      </CartesianChart>
    </View>
  );
}

export default ZoomableDoseRateChart;
```
### Customizing Zoom and Pan Behavior

You can further customize the zoom and pan behavior:

```javascript
transformConfig={{
  // Pan configuration
  pan: {
    enabled: true,
    dimensions: ["x", "y"], // "x", "y", or both
    activateAfterLongPress: false, // Set to true to require long press before panning
    minDistance: 0, // Minimum distance before pan activates
  },
  // Pinch-to-zoom configuration
  pinch: {
    enabled: true,
    dimensions: ["x"], // "x", "y", or both
    minScale: 0.5, // Minimum zoom scale
    maxScale: 10, // Maximum zoom scale
  }
}}
```

### Setting Initial Viewport

You can set the initial viewport to focus on a specific time range:

```javascript
// Calculate timestamp for 7 days ago
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

// Calculate timestamp for today
const today = new Date();

<CartesianChart
  // ...other props
  domain={{
    x: [sevenDaysAgo.getTime(), today.getTime()], // Initial x-axis range
    y: [0, 3], // Initial y-axis range for doseRate in µSv
  }}
  transformState={transformState}
  // ...other props
>
  {/* ...chart content */}
</CartesianChart>
```

## 6. Interactive Features

Let's add tooltips to display precise values when users interact with the chart:

### Basic Tooltip Implementation

```javascript
import React from "react";
import { View } from "react-native";
import { CartesianChart, Line, useChartPressState, useChartTransformState } from "victory-native";
import { Circle, Text, useFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import type { SharedValue } from "react-native-reanimated";
import inter from "../assets/fonts/inter-medium.ttf";

function InteractiveDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Sample time-series data
  const DATA = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      timestamp: date.getTime(),
      doseRate: 0.5 + 2 * Math.random(),
    };
  });

  // Create transform state for pan/zoom
  const transformState = useChartTransformState({
    scaleX: 1.0,
    scaleY: 1.0,
  });
  
  // Create press state for tooltip
  const { state, isActive } = useChartPressState({ 
    x: 0, 
    y: { doseRate: 0 } 
  });

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={DATA}
        xKey="timestamp"
        yKeys={["doseRate"]}
        xAxis={{
          font,
          formatXLabel: (value) => format(new Date(value), "MM/dd"),
          labelRotate: 45,
        }}
        yAxis={[{
          font,
          formatYLabel: (value) => `${value.toFixed(2)} µSv`,
        }]}
        transformState={transformState}
        transformConfig={{
          pan: { enabled: true, dimensions: ["x", "y"] },
          pinch: { enabled: true, dimensions: ["x"] },
        }}
        // Connect press state for tooltips
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line 
              points={points.doseRate} 
              color="#1E88E5" 
              strokeWidth={2}
              curveType="natural"
            />
            
            {/* Show tooltip when chart is pressed */}
            {isActive && (
              <Tooltip 
                x={state.x.position} 
                y={state.y.doseRate.position}
                value={state.y.doseRate.value}
                timestamp={state.x.value}
              />
            )}
          </>
        )}
      </CartesianChart>
    </View>
  );
}

// Custom tooltip component
function Tooltip({ 
  x, 
  y, 
  value, 
  timestamp 
}: { 
  x: SharedValue<number>; 
  y: SharedValue<number>;
  value: SharedValue<number>;
  timestamp: SharedValue<number>;
}) {
  const font = useFont(inter, 12);
  
  if (!font) return null;
  
  return (
    <>
      {/* Marker at data point */}
      <Circle cx={x} cy={y} r={6} color="rgba(30, 136, 229, 0.7)" />
      
      {/* Tooltip background */}
      <rect 
        x={x} 
        y={y} 
        width={120} 
        height={50} 
        rx={4}
        fill="rgba(0, 0, 0, 0.7)"
        dx={10}
        dy={-60}
      />
      
      {/* Tooltip text */}
      <Text 
        x={x} 
        y={y} 
        text={`Date: ${format(new Date(timestamp.value), "MM/dd/yyyy")}`}
        font={font}
        color="white"
        dx={15}
        dy={-45}
      />
      <Text 
        x={x} 
        y={y} 
        text={`Dose: ${value.value.toFixed(2)} µSv`}
        font={font}
        color="white"
        dx={15}
        dy={-25}
      />
    </>
  );
}

export default InteractiveDoseRateChart;
```
### Customizing Tooltip Behavior

You can customize how tooltips activate and behave:

```javascript
// Configure chart press behavior
chartPressConfig={{
  activateAfterLongPress: false, // Set to true to require long press
  minDistance: 0, // Minimum distance before activation
  hitSlop: 20, // Increase hit area for easier activation
}}
```

### Combining Tooltips with Zoom/Pan

When combining tooltips with zoom and pan functionality, you may want to configure how these gestures interact:

```javascript
// Configure gesture priority
gestureConfig={{
  simultaneousHandlers: [], // Allow gestures to work simultaneously
  exclusiveHandlers: [], // Gestures that should block others
}}
```

## 7. Performance Optimization

For large time-series datasets, performance optimization becomes crucial:

### Data Downsampling

```javascript
import React, { useMemo } from "react";
import { View } from "react-native";
import { CartesianChart, Line, useChartTransformState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import inter from "../assets/fonts/inter-medium.ttf";

function OptimizedDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Generate a large dataset (e.g., hourly readings for a month)
  const rawData = useMemo(() => {
    const result = [];
    const now = new Date();
    // 24 hours * 30 days = 720 data points
    for (let i = 720; i >= 0; i--) {
      const timestamp = new Date(now);
      timestamp.setHours(timestamp.getHours() - i);
      result.push({
        timestamp: timestamp.getTime(),
        doseRate: 0.5 + 2 * Math.random(),
      });
    }
    return result;
  }, []);
  
  // Downsample data based on current view
  const downsampledData = useMemo(() => {
    // For large datasets, implement a downsampling algorithm
    // This simple example takes every 6th point (4 per day instead of 24)
    return rawData.filter((_, index) => index % 6 === 0);
  }, [rawData]);
  
  const transformState = useChartTransformState({
    scaleX: 1.0,
    scaleY: 1.0,
  });

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={downsampledData} // Use downsampled data
        xKey="timestamp"
        yKeys={["doseRate"]}
        // ... other props as before
        transformState={transformState}
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="#1E88E5" 
            strokeWidth={2}
            curveType="natural"
          />
        )}
      </CartesianChart>
    </View>
  );
}

export default OptimizedDoseRateChart;
```

### Advanced Downsampling Strategies

For more sophisticated downsampling, consider these approaches:

1. **Largest-Triangle-Three-Buckets (LTTB)**: Preserves visual characteristics of the data
2. **Min-Max Downsampling**: Keeps minimum and maximum values in each bucket
3. **Time-Based Bucketing**: Groups data by time periods (hours, days, etc.)

Here's a simple min-max implementation:

```javascript
function minMaxDownsample(data, bucketSize) {
  const result = [];
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    if (bucket.length === 0) continue;
    
    // Find min and max in this bucket
    let minPoint = bucket[0];
    let maxPoint = bucket[0];
    
    for (const point of bucket) {
      if (point.doseRate < minPoint.doseRate) minPoint = point;
      if (point.doseRate > maxPoint.doseRate) maxPoint = point;
    }
    
    // Add min point first (if different from max)
    if (minPoint.timestamp !== maxPoint.timestamp) {
      if (minPoint.timestamp < maxPoint.timestamp) {
        result.push(minPoint);
        result.push(maxPoint);
      } else {
        result.push(maxPoint);
        result.push(minPoint);
      }
    } else {
      // If min and max are the same point
      result.push(minPoint);
    }
  }
  
  return result;
}

// Usage
const downsampledData = useMemo(() => {
  return minMaxDownsample(rawData, 12); // 12 points per bucket
}, [rawData]);
```

### Memoization for Rendering Optimization

Use React's `useMemo` and `useCallback` hooks to prevent unnecessary recalculations:

```javascript
// Memoize data processing
const processedData = useMemo(() => {
  return rawData.map(point => ({
    ...point,
    // Any transformations needed
    doseRate: point.doseRate * conversionFactor
  }));
}, [rawData, conversionFactor]);

// Memoize callback functions
const handleDataPointPress = useCallback((index) => {
  // Handle press event
  console.log(`Data point ${index} pressed`);
}, []);
```

## 8. Real-Time Data Updates

For monitoring applications, you'll often need to update charts in real-time:

### Basic Real-Time Updates

```javascript
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { CartesianChart, Line, useChartTransformState } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import inter from "../assets/fonts/inter-medium.ttf";

function RealTimeDoseRateChart() {
  const font = useFont(inter, 12);
  const [data, setData] = useState([]);
  
  // Create transform state
  const transformState = useChartTransformState({
    scaleX: 1.0,
    scaleY: 1.0,
  });
  
  // Simulate real-time data updates
  useEffect(() => {
    // Initial data
    const initialData = Array.from({ length: 20 }, (_, i) => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - (20 - i));
      return {
        timestamp: date.getTime(),
        doseRate: 0.5 + 2 * Math.random(),
      };
    });
    
    setData(initialData);
    
    // Set up interval for new data
    const interval = setInterval(() => {
      const newPoint = {
        timestamp: new Date().getTime(),
        doseRate: 0.5 + 2 * Math.random(),
      };
      
      setData(currentData => {
        // Keep a sliding window of the last 20 points
        const newData = [...currentData, newPoint];
        if (newData.length > 20) {
          return newData.slice(newData.length - 20);
        }
        return newData;
      });
    }, 5000); // Add new point every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-scroll to show latest data
  useEffect(() => {
    if (data.length > 0) {
      // Calculate domain to show the latest data
      const latestTimestamp = data[data.length - 1].timestamp;
      const earliestVisibleTimestamp = latestTimestamp - (20 * 60 * 1000); // 20 minutes
      
      // Update domain to auto-scroll
      transformState.setDomain({
        x: [earliestVisibleTimestamp, latestTimestamp],
        y: [0, 3], // Fixed y range for doseRate
      });
    }
  }, [data, transformState]);

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={data}
        xKey="timestamp"
        yKeys={["doseRate"]}
        xAxis={{
          font,
          formatXLabel: (value) => format(new Date(value), "HH:mm"),
        }}
        yAxis={[{
          font,
          formatYLabel: (value) => `${value.toFixed(2)} µSv`,
        }]}
        transformState={transformState}
        // Animate new data points
        animate={{
          type: "timing",
          duration: 500,
        }}
      >
        {({ points }) => (
          <Line 
            points={points.doseRate} 
            color="#1E88E5" 
            strokeWidth={2}
            curveType="natural"
          />
        )}
      </CartesianChart>
    </View>
  );
}

export default RealTimeDoseRateChart;
```
### Managing Domain Updates

For real-time data, you need to decide how to handle the domain (visible range):

1. **Auto-scrolling**: Automatically adjust the domain to show the latest data
2. **Fixed Window**: Keep a fixed time window (e.g., last 30 minutes)
3. **User Control**: Allow users to toggle between auto-scroll and manual control

Here's how to implement user-controlled auto-scrolling:

```javascript
function RealTimeDoseRateChart() {
  // ... other state and setup
  
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Auto-scroll effect
  useEffect(() => {
    if (data.length > 0 && autoScroll) {
      // Calculate domain to show the latest data
      const latestTimestamp = data[data.length - 1].timestamp;
      const earliestVisibleTimestamp = latestTimestamp - (20 * 60 * 1000); // 20 minutes
      
      // Update domain to auto-scroll
      transformState.setDomain({
        x: [earliestVisibleTimestamp, latestTimestamp],
        y: [0, 3],
      });
    }
  }, [data, autoScroll, transformState]);
  
  // Disable auto-scroll when user pans
  const handlePanStart = useCallback(() => {
    setAutoScroll(false);
  }, []);
  
  // Button to re-enable auto-scroll
  const handleResumeAutoScroll = useCallback(() => {
    setAutoScroll(true);
  }, []);
  
  return (
    <View style={{ height: 350, padding: 10 }}>
      <CartesianChart
        // ... other props
        transformState={transformState}
        transformConfig={{
          pan: { 
            enabled: true, 
            dimensions: ["x", "y"],
            onStart: handlePanStart,
          },
          pinch: { enabled: true, dimensions: ["x"] },
        }}
      >
        {/* ... chart content */}
      </CartesianChart>
      
      {!autoScroll && (
        <Button 
          title="Resume Auto-Scroll" 
          onPress={handleResumeAutoScroll} 
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
}
```

## 9. Advanced Customization

Victory Native offers extensive customization options for specialized requirements:

### Multiple Y-Axes for Related Metrics

```javascript
import React from "react";
import { View } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import inter from "../assets/fonts/inter-medium.ttf";

function MultiAxisDoseRateChart() {
  const font = useFont(inter, 12);
  
  // Sample data with multiple metrics
  const DATA = Array.from({ length: 31 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      timestamp: date.getTime(),
      doseRate: 0.5 + 2 * Math.random(), // µSv
      temperature: 20 + 5 * Math.random(), // °C
    };
  });

  return (
    <View style={{ height: 300, padding: 10 }}>
      <CartesianChart
        data={DATA}
        xKey="timestamp"
        yKeys={["doseRate", "temperature"]}
        xAxis={{
          font,
          formatXLabel: (value) => format(new Date(value), "MM/dd"),
          labelRotate: 45,
        }}
        // Configure multiple y-axes
        yAxis={[
          {
            font,
            key: "doseRate",
            formatYLabel: (value) => `${value.toFixed(2)} µSv`,
            position: "left",
            labelColor: "#1E88E5",
          },
          {
            font,
            key: "temperature",
            formatYLabel: (value) => `${value.toFixed(1)} °C`,
            position: "right",
            labelColor: "#FF5722",
          }
        ]}
      >
        {({ points }) => (
          <>
            {/* Dose rate line */}
            <Line 
              points={points.doseRate} 
              color="#1E88E5" 
              strokeWidth={2}
              curveType="natural"
            />
            
            {/* Temperature line */}
            <Line 
              points={points.temperature} 
              color="#FF5722" 
              strokeWidth={2}
              curveType="natural"
            />
          </>
        )}
      </CartesianChart>
    </View>
  );
}

export default MultiAxisDoseRateChart;
```

### Reference Lines and Regions

You can add reference lines to indicate thresholds or important values:

```javascript
import { CartesianChart, Line } from "victory-native";
import { Path, useFont } from "@shopify/react-native-skia";

function DoseRateWithThresholds() {
  // ... setup and data
  
  // Define threshold values for doseRate
  const warningThreshold = 1.5; // µSv
  const dangerThreshold = 2.5; // µSv
  
  return (
    <CartesianChart
      data={DATA}
      xKey="timestamp"
      yKeys={["doseRate"]}
      // ... other props
    >
      {({ points, chartBounds }) => (
        <>
          {/* Main data line */}
          <Line 
            points={points.doseRate} 
            color="#1E88E5" 
            strokeWidth={2}
          />
          
          {/* Warning threshold line */}
          <Path
            path={`M ${chartBounds.left} ${chartBounds.top + chartBounds.height - (warningThreshold / 3) * chartBounds.height} H ${chartBounds.right}`}
            color="#FFC107"
            style="stroke"
            strokeWidth={1}
            strokeDash={[5, 5]}
          />
          
          {/* Danger threshold line */}
          <Path
            path={`M ${chartBounds.left} ${chartBounds.top + chartBounds.height - (dangerThreshold / 3) * chartBounds.height} H ${chartBounds.right}`}
            color="#F44336"
            style="stroke"
            strokeWidth={1}
            strokeDash={[5, 5]}
          />
        </>
      )}
    </CartesianChart>
  );
}
```

### Custom Gestures

For specialized interaction needs, you can implement custom gestures:

```javascript
import { Gesture, GestureDetector } from "react-native-gesture-handler";

function CustomGestureDoseRateChart() {
  // ... setup and state
  
  // Create a custom double tap gesture
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(({ x, y }) => {
      // Reset zoom on double tap
      transformState.resetTransform();
    });
  
  return (
    <GestureDetector gesture={doubleTapGesture}>
      <View style={{ height: 300 }}>
        <CartesianChart
          // ... chart props
        >
          {/* ... chart content */}
        </CartesianChart>
      </View>
    </GestureDetector>
  );
}
```

## 10. Best Practices & Troubleshooting

### Performance Best Practices

1. **Data Management**:
   - Downsample large datasets before rendering
   - Use windowing for real-time data (keep a fixed number of points)
   - Memoize data processing with `useMemo`

2. **Rendering Optimization**:
   - Use appropriate curve types (linear is fastest)
   - Avoid unnecessary re-renders with `useCallback` and `useMemo`
   - Consider using `React.memo` for chart components

3. **Gesture Handling**:
   - Configure gesture interactions carefully to avoid conflicts
   - Use exclusive handlers for gestures that should block others

### Common Issues and Solutions

#### Chart Not Rendering

If your chart isn't rendering, check:

1. **Data Format**: Ensure your data objects have the correct property names
2. **Font Loading**: Check if `useFont` has loaded successfully
3. **Container Size**: Make sure the container has a defined height

```javascript
// Check if font is loaded before rendering
const font = useFont(inter, 12);
if (!font) return <View style={{ height: 300 }}><Text>Loading...</Text></View>;
```

#### Zoom/Pan Not Working

If zoom and pan aren't working:

1. **Transform State**: Ensure `transformState` is properly connected
2. **Gesture Handler**: Make sure react-native-gesture-handler is properly set up
3. **Dimensions**: Check that you've enabled the correct dimensions in `transformConfig`

#### Tooltip Positioning Issues

For tooltip positioning problems:

1. **Coordinate Space**: Ensure you're using the correct coordinate values
2. **Overflow**: Add clipping or position adjustment logic for edge cases
3. **Hit Testing**: Adjust `hitSlop` for easier activation

### Accessibility Considerations

1. **Color Choices**: Use high-contrast colors and avoid relying solely on color
2. **Text Size**: Ensure labels are readable at different zoom levels
3. **Alternative Representations**: Consider providing tabular data alongside charts

### Resources for Further Learning

- [Victory Native Documentation](https://formidable.com/open-source/victory/docs/native/)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

By following this guide, you should now have a solid understanding of how to implement interactive time-series charts for visualizing doseRate data in React Native applications using Victory Native. The techniques covered here can be adapted for various scientific and monitoring applications that require high-performance data visualization.