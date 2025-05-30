import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import DoseHistoryView from '../components/History/DoseHistoryView';
import Header from '@/components/Header';
import { COLORS } from '../Themes/theme';


export default function DoseHistoryViewPage() {
  // Get params passed from DoseHistory
  const params = useLocalSearchParams();
  const { date, startTime } = params;
  console.log('date type:', typeof date);
  console.log('startTime type:', typeof startTime);
  
 
  // Ensure params are strings
  const dateStr = typeof date === 'string' ? date : String(date);
  const startTimeStr = typeof startTime === 'string' ? startTime : String(startTime);
  
  return (
    <View style={{ flex: 1 }}>
      <Header title="Dose History" showBackButton={true} />
      <View style={{ flex: 1 }}>
          <DoseHistoryView 
            key={`history-view-${Date.now()}`} // Force new instance on each render
            date={dateStr}
            startTime={startTimeStr}
          />
      </View>
    </View>

   
  );
} 