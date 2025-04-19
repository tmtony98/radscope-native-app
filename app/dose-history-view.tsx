import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DoseHistoryView from '../components/History/DoseHistoryView';
import Header from '@/components/Header';


export default function DoseHistoryViewPage() {
  // Get params passed from DoseHistory
  const params = useLocalSearchParams();
  const { date, startTime } = params;
  console.log('date type:', typeof date);
  console.log('startTime type:', typeof startTime);


  // console.log(" initial date", date);
  // console.log(" initial selectedStartTime at ", startTime);
  // console.log("endTime", endTime);
  
  
  // Parse the date and startTime safely
  // const parseDateParam = (param: string | string[] | undefined): Date | undefined => {
  //   if (!param) return undefined;
  //   const value = Array.isArray(param) ? param[0] : param;
  //   const dateObj = new Date(value);
  //   return isNaN(dateObj.getTime()) ? undefined : dateObj;
  // };

  // const parsedDate = parseDateParam(date);
  // const parsedStartTime = parseDateParam(startTime);
  
  return (
    <View style={{ flex: 1 }}>
    <Header title="Dose History" showBackButton={true} />
    <View style={{ flex: 1 }}>
      <DoseHistoryView 
        date={date as string }
        startTime={startTime as string}
        // endTime={endTime as string}
        // selectedDateTime={selectedDateTime}
      />
    </View>
    </View>

   
  );
} 