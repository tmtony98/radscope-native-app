import React from 'react';
import { View } from 'react-native';
import DoseHistory from '../components/History/DoseHistory';
import Header from '@/components/Header';

export default function DoseHistoryPage() {
  return (
    <View style={{ flex: 1 }}>
       <Header title="Dose History" showBackButton={true} />
      <DoseHistory />
    </View>
  );
} 