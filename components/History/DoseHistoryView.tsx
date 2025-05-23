import { View, StyleSheet, ScrollView, Dimensions, Image, ActivityIndicator, Text as RNText } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { COLORS, SPACING, TYPOGRAPHY, CARD_STYLE } from "../../Themes/theme";
import {
  Text,
  Surface,
  IconButton,
  Card,
  Divider,
  MD3Colors,
} from "react-native-paper";
import { CartesianChart, Line, Area, useChartTransformState, useChartPressState } from "victory-native";
import { useFont, Circle, Text as SkiaText, Rect } from "@shopify/react-native-skia";
import inter from "../../assets/fonts/Inter/static/Inter_18pt-Bold.ttf";
import { getDoseRateDataByDateTime, DoseRateDataPoint } from "../../utils/DoseRateFileUtils";
import { format } from "date-fns";

type DoseHistoryViewProps = {
  date?: string;
  startTime?: string;
  // endTime?: string;
  // selectedDateTime?: Date;
};

export default function DoseHistoryView({
  date,
  startTime,
}: DoseHistoryViewProps) {
  const router = useRouter();

  console.log("startTimeeeeee", startTime);
  
  const [doseRateData, setDoseRateData] = useState<DoseRateDataPoint[]>([]);
  const [doseRateValues, setDoseRateValues] = useState<number[]>([]);
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [formattedData, setFormattedData] = useState<Array<{ timestamp: number; doseRate: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  // Create transform state for optimized rendering and pan/zoom functionality
  const { state: transformState } = useChartTransformState({
    scaleX: 1., // Initial X-axis scale
    scaleY: 1.0, // Initial Y-axis scale
  });

  // Create press state for tooltip
  const { state: pressState, isActive: isPressActive } = useChartPressState({ 
    x: 0, 
    y: { doseRate: 0 } 
  });

  // Load the font for the chart
  const font = useFont(inter, 12);

  // Format time labels for display on the chart
  const formatTimeLabel = (timestamp: string): string => {
    try {
      // Parse the timestamp from the format "YYYY-MM-DD HH:mm:ss" (local time)
      const [datePart, timePart] = timestamp.split(' ');
      if (!datePart || !timePart) return timestamp;
      
      const [hours, minutes] = timePart.split(':');
      if (!hours || !minutes) return timestamp;
      
      // Convert to 12-hour format with AM/PM for better readability
      const hourNum = parseInt(hours, 10);
      if (isNaN(hourNum)) return timestamp;
      
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.warn('Error formatting time label:', error);
      return timestamp;
    }
  };
  
  // Calculate end time by adding 10 minutes to start time (in 12-hour format)
  const calculateEndTime = (startTimeStr: string | undefined): string => {
    if (!startTimeStr) return "-";
    
    try {
      
      // Parse the 12-hour format time (e.g., "10:25 PM")
      const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
      const match = startTimeStr.match(timeRegex);
      
      if (!match) {
        console.error('Start time is not in expected format:', startTimeStr);
        return "-";
      }
      
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      
      // Convert to 24-hour format
      if (period === 'PM' && hours < 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Create date objects for calculation
      const now = new Date();
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      // Add 10 minutes to start time
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 10);
      
      // If end time exceeds current time, use current time
      const finalEndDate = endDate > now ? now : endDate;
      
      // Format back to 12-hour format
      let endHours = finalEndDate.getHours();
      const endMinutes = finalEndDate.getMinutes();
      const endPeriod = endHours >= 12 ? 'PM' : 'AM';
      
      // Convert hours back to 12-hour format
      endHours = endHours % 12 || 12;
      
      return `${endHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
    } catch (error) {
      console.error('Error calculating end time:', error);
      return "-";
    }
  };
  
  // Calculate end time when start time changes - run immediately
  useEffect(() => {
    if (startTime) {
      const calculatedEndTime = calculateEndTime(startTime);
      setEndTime(calculatedEndTime);
    }
  }, [startTime]);
  
  // Force immediate rendering when component mounts
  useEffect(() => {
    // Immediately set loading state to ensure UI feedback
    setIsLoading(true);
    
    // Force a re-render after a short delay
    const renderTimer = setTimeout(() => {
      // This will trigger a re-render
      setFormattedData(prevData => prevData.length > 0 ? [...prevData] : []);
    }, 100);
    
    return () => clearTimeout(renderTimer);
  }, []);

  useEffect(() => {
    const fetchDoseRateData = async () => {
      if (date && startTime) {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log("Fetching data for date:", date, "startTime:", startTime);
          
          // Fetch dose rate data for the selected date and time
          const data = await getDoseRateDataByDateTime(date, startTime, 10);
          console.log("Raw data received:", data);
          console.log("Data length:", data.length);
          
          if (data.length === 0) {
            console.warn("No data found for the selected date and time");
            setError('No dose rate data found for the selected date and time.');
            setIsLoading(false);
            return;
          }
          
          // Log a sample data point to verify format
          if (data.length > 0) {
            console.log("Sample data point:", JSON.stringify(data[0]));
            console.log("Sample time_stamp format:", data[0].time_stamp);
          }
          
          setDoseRateData(data);
          
          // Extract dose rate values and format time labels for the chart
          setDoseRateValues(data.map(item => item.doseRate));
          setTimeLabels(data.map(item => formatTimeLabel(item.time_stamp)));
          
          // Process data immediately without batching to avoid rendering issues
          try {
            const chartData = data.map((item, index) => {
              try {
                if (!item.time_stamp) {
                  console.warn("Missing time_stamp in data point at index", index);
                  return null;
                }
                
                const [datePart, timePart] = item.time_stamp.split(' ');
                if (!datePart || !timePart) {
                  console.warn("Invalid time_stamp format at index", index, item.time_stamp);
                  return null;
                }
                
                const [year, month, day] = datePart.split('-').map(Number);
                const [hours, minutes, seconds] = timePart.split(':').map(Number);
                
                // Create a date object in local time
                const timestamp = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
                
                if (isNaN(timestamp)) {
                  console.warn("Invalid timestamp created at index", index, item.time_stamp);
                  return null;
                }
                
                return {
                  timestamp,
                  doseRate: item.doseRate
                };
              } catch (error) {
                console.warn('Error parsing timestamp:', item.time_stamp, error);
                return null;
              }
            }).filter(item => item !== null && (item as any).timestamp > 0);
            
            console.log("Formatted chart data:", chartData);
            console.log("Chart data length:", chartData.length);
            
            if (chartData.length === 0) {
              console.warn("No valid data points after formatting");
              setError('Could not process the dose rate data. Invalid timestamp format.');
            } else {
              // Sort data by timestamp to ensure correct display
              const validData = chartData.filter((item): item is { timestamp: number; doseRate: number } => item !== null);
              const sortedData = [...validData].sort((a, b) => a.timestamp - b.timestamp);
              
              // Update state directly without animation frame
              setFormattedData(sortedData);
              
              // Delay setting loading to false to ensure UI updates
              setTimeout(() => {
                setIsLoading(false);
              }, 100);
            }
          } catch (err) {
            console.error('Error processing data:', err);
            setError('Failed to process dose rate data. Please try again.');
            setIsLoading(false);
          }
          
        } catch (err) {
          console.error('Error fetching dose rate data:', err);
          setError('Failed to load dose rate data. Please try again.');
          setIsLoading(false);
        }
      }
    };
    
    fetchDoseRateData();
  }, [date, startTime]);

  //get the latest 10 values
  //const DoseRateLabels = doseRateValues.slice(-10);
  // const TimeLabels = timeLabels.slice(-10);
  // console.log("DoseRateLabels", DoseRateLabels);

  // Mock data for the graph

  // Mock data for the graph
  // const graphData = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  //   datasets: [
  //     {
  //       data: [
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100
  //       ],
  //       color: (opacity = 1) => `rgba(71, 92, 119, ${opacity})`, // Dark blue color
  //       strokeWidth: 2
  //     }
  //   ],
  //   legend: ["Dose Rate"]
  // };

  // Format date as shown in the UI
  // const formatSelectedDate = () => {
  //   const formattedDate = selectedDateTime.toLocaleDateString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     year: 'numeric'
  //   });

  //   const formattedTime = selectedDateTime.toLocaleTimeString('en-US', {
  //     hour: 'numeric',
  //     minute: '2-digit',
  //     hour12: true
  //   });

  //   return `${formattedTime}`;
  // };

  // Define dynamic y-axis domain values based on data
  const calculateYDomain = (): [number, number] => {
    // Default values if no data
    const defaultMin = 0;
    const defaultMax = 0.1;
    
    if (formattedData.length === 0) return [defaultMin, defaultMax];
    
    // Find the minimum and maximum dose rate values in the data
    const minDoseRate = Math.min(...formattedData.map(point => point.doseRate));
    const maxDoseRate = Math.max(...formattedData.map(point => point.doseRate));
    
    // Set minimum to 0 or slightly below the minimum value
    const yMin = Math.max(0, minDoseRate * 0.8);
    
    // Set maximum to be the max value plus some padding
    const yMax = maxDoseRate <= defaultMax ? 
      defaultMax : (maxDoseRate + (maxDoseRate / 3));
    
    return [yMin, yMax];
  };
  
  console.log("Rendering DoseHistoryView with:", { 
    date, 
    startTime, 
    isLoading, 
    error, 
    dataLength: formattedData.length,
    yDomain: calculateYDomain
  });
  
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      {/* Date Selection */}
      <View style={styles.card}>
      <Text style={TYPOGRAPHY.TitleMedium}>Select Another Date</Text>

        <View style={styles.dateContainer}>
          <View style={styles.dateValue}>
            <Text style={styles.dateText}>
              {startTime} -{endTime}
            </Text>
            <Text style={styles.endDateText}>{date}</Text>
            <IconButton
              icon="calendar"
              size={20}
              onPress={() => router.back()}
              style={styles.calendarIcon}
            />
          </View>
        </View>
      </View>

      {/* Dose Rate Graph */}
      

      {/* Graph Parameters */}
      <View style={CARD_STYLE.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading dose rate data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : formattedData.length > 0 ? (
        <View style={styles.graphContainer}>
          {/* Add key to force re-render */}
          <View 
            style={{ height: 300, width: '100%' }} 
            key={`graph-container-${formattedData.length}`}>
            <CartesianChart
              data={formattedData}
              xKey="timestamp"
              yKeys={["doseRate"]}
              axisOptions={{ 
                font,
                lineWidth: 1,
                lineColor: "#CCCCCC",
                labelColor: "#333333",
                formatYLabel: (value: number) => value.toFixed(3),
                tickCount: 8
              }}
              domain={{ y: calculateYDomain() }}
              transformState={transformState}
              transformConfig={{
                pan: { enabled: true, dimensions: ["x"] },
              pinch: { enabled: true, dimensions: ["x"] },
              }}
              chartPressState={pressState}
              xAxis={{
                formatXLabel: (label: number) => {
                  const date = new Date(label);
                  // 24-hour format, no AM/PM
                  return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                  });
                },
                font,
                labelRotate: 45,
                tickCount: 8, // Limit the number of ticks for better readability
              }}
            >
              {({ points, chartBounds }) => (
                <>
                  <Area
                    points={points.doseRate}
                    y0={chartBounds.bottom}
                    color="rgba(30, 136, 229, 0.2)"
                    curveType="natural"
                    opacity={0.6}
                  />
                  <Line 
                    points={points.doseRate} 
                    color="#1E88E5" 
                    strokeWidth={2.5}
                    curveType="natural"
                  />
                  
                  {/* Show tooltip when chart is pressed */}
                  {isPressActive && pressState?.x && pressState?.y?.doseRate && (
                    <>
                      {/* Vertical line indicator */}
                      <Line
                        points={[
                          { 
                            x: pressState.x.position.value, 
                            y: chartBounds.top,
                            xValue: pressState.x.value.value,
                            yValue: chartBounds.top
                          },
                          { 
                            x: pressState.x.position.value, 
                            y: chartBounds.bottom,
                            xValue: pressState.x.value.value,
                            yValue: chartBounds.bottom
                          }
                        ]}
                        color="rgba(30, 136, 229, 0.7)"
                        strokeWidth={1}
                      />
                      
                      {/* Small dot at the exact data point */}
                      <Circle
                        cx={pressState.x.position.value}
                        cy={pressState.y.doseRate.position.value}
                        r={5}
                        color="#1E88E5"
                      />
                      
                      {/* Create a background for the tooltip */}
                      <Rect
                        x={pressState.x.position.value - 15}
                        y={pressState.y.doseRate.position.value - 70}
                        width={100}
                        height={50}
                        color="#F5F9FC"
                      />
                      
                      {/* Display tooltip with formatted values */}
                      <SkiaText
                        x={pressState.x.position.value}
                        y={pressState.y.doseRate.position.value - 50}
                        text={`${pressState.y.doseRate.value.value.toFixed(3)} µSv/h`}
                        font={font}
                        color="#333333"
                      />
                      <SkiaText
                        x={pressState.x.position.value}
                        y={pressState.y.doseRate.position.value - 30}
                        text={`${format(new Date(pressState.x.value.value), 'HH:mm:ss')}`}
                        font={font}
                        color="#333333"
                      />
                    </>
                  )}
                </>
              )}
            </CartesianChart>
          </View>
          
          {/* Add the label just below the graph */}
          <RNText
            style={{
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 4,
              color: COLORS.textSecondary,
              fontSize: 14,
              fontWeight: '500',
              letterSpacing: 0.2,
            }}
          >
            Dose Rate (µSv/h) vs Time (HH:MM:SS)
          </RNText>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for this time.</Text>
        </View>
      )}
      <Divider style={styles.divider} />
        <Text  style={TYPOGRAPHY.headLineSmall}>
          Graph Parameters
        </Text>

        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>Start Time</Text>
          <Text style={TYPOGRAPHY.TitleMedium}>
            {startTime || "-"}
          </Text>
        </View>
        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>End Time</Text>
          <Text style={TYPOGRAPHY.TitleMedium}>{endTime || "-"}</Text>
        </View>
        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>Date</Text>
          <Text style={TYPOGRAPHY.TitleMedium}>
            {date || "-"}
          </Text>
        </View>

       
        
       
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#31435E",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48,
  },
  card: {
    // marginHorizontal: 8,
    ...CARD_STYLE.container,
    marginVertical: 8,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',

  },
  dateContainer: {
    flexDirection: "row",
    width:"100%",
    borderRadius: 8,
  },
  dateLabel: {
    color: "#333",
  },
  dateValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // This spreads out the children
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
    width: "100%"
  },
  dateText: {
    color: "#333",
    flex: 1, // Takes up available space
  },
  endDateText: {
    color: "#333",
    marginRight: 8, // Add some space before the calendar icon
  },
  calendarIcon: {
    margin: 0,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  graphContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 8,
    color: COLORS.text,
  },
  loadingContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5', // Light grey color
    borderRadius: 8,
    marginHorizontal: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    ...TYPOGRAPHY.bodyTextMedium,
    textAlign: 'center'
  },
  noDataContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5', // Light grey color
    borderRadius: 8,
    marginHorizontal: SPACING.md,
  },
  noDataText: {
    color: COLORS.text,
    ...TYPOGRAPHY.bodyTextMedium,
    textAlign: 'center'
  },
  paramRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  paramLabel: {
    fontSize: 16,
    color: "#333",
  },
  paramValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    backgroundColor: "#E5E5E5",
    marginVertical: SPACING.md,
  },
  chartPlaceholder: {
    height: 250,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: COLORS.border,
    // borderStyle: 'solid',
  },
});
