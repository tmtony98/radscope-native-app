import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DoseHistoryView from '../components/History/DoseHistoryView';
import Header from '@/components/Header';


export default function DoseHistoryViewPage() {
  // Get params passed from DoseHistory
  const params = useLocalSearchParams();
  const { date, startTime,  } = params;

  console.log("date", date);
  console.log("startTime", startTime);
  // console.log("endTime", endTime);
  
  
  // Parse the date if necessary
  const selectedDateTime = new Date();
  
  return (
    <View style={{ flex: 1 }}>
    <Header title="Dose History" showBackButton={true} />
    <View style={{ flex: 1 }}>
      <DoseHistoryView 
        date={date as string}
        startTime={startTime as string}
        // endTime={endTime as string}
        // selectedDateTime={selectedDateTime}
      />
    </View>
    </View>

   
  );
} 