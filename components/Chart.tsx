import useMqtt from '@/Hooks/useMqtt';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import { LineChart } from "react-native-chart-kit";


type Data = {
  timestamp: string;
  value: number;
}

type ChartData = {
  doseRate: number;
  timestamp: string | Date;
}

export default function Chart({ data }: { data: Data[] }) {
  // Keep track of chart history data
  const [chartHistory, setChartHistory] = useState<ChartData[]>([]);
  const { doseRateData } = useMqtt();

  // Keep historical data when new data comes in
  useEffect(() => {
    if (data && data.length > 0) {
      // Convert incoming data to proper format
      const newData = data.map(item => ({
        doseRate: item.value,
        timestamp: item.timestamp
      }));
      
      // Add new data to history (keeping only last 20 points)
      setChartHistory(prev => {
        const combined = [...newData, ...prev];
        return combined.slice(0, 20); // Keep only last 20 points
      });
    }
  }, [data]);

  // Format timestamps correctly for display
  const formatTimestamp = (timestamp: string | Date): string => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Error';
    }
  };

  // Filter out invalid data points
  const validData = chartHistory.filter(item => 
    item && 
    typeof item.doseRate === 'number' &&
    isFinite(item.doseRate) && 
    !isNaN(item.doseRate)
  );
  
  console.log("Chart valid data", validData);
  
  // Prepare chart data
  const chartData = validData.length > 0 
    ? validData.map(item => item.doseRate)
    : [0];
    
  // Prepare chart labels - newest first, then reverse for display
  const chartLabels = validData.length > 0 
    ? validData.map(item => formatTimestamp(item.timestamp)).slice(0, 6).reverse()
    : ["No Data"];
  
  // Reverse data array to match labels (newest data first in state, but should be last on chart)
  const sortedChartData = [...chartData].slice(0, 6).reverse();

  console.log("chartLabels", chartLabels);
  console.log("chartData", sortedChartData);

  return (
    <View>
      <Text>Dose Rate Chart</Text>
      <LineChart
        data={{
          labels: chartLabels,
          datasets: [
            {
              data: sortedChartData.length > 0 ? sortedChartData : [0]
            }
          ]
        }}
        width={Dimensions.get("window").width - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(14, 23, 37, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  )
}
