import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DoseHistoryView from '../components/History/DoseHistoryView';

export default function DoseHistoryViewPage() {
  // Get params passed from DoseHistory
  const params = useLocalSearchParams();
  const { date, startTime, endTime } = params;
  
  // Parse the date if necessary
  const selectedDateTime = new Date();
  
  return (
    <View style={{ flex: 1 }}>
      <DoseHistoryView 
        date={date as string}
        startTime={startTime as string}
        endTime={endTime as string}
        selectedDateTime={selectedDateTime}
      />
    </View>
  );
} 