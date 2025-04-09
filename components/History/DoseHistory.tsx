import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { COLORS, SPACING } from '../../Themes/theme'
import { 
  Text, 
  Button, 
  Surface, 
  Portal, 
  Modal, 
  IconButton,
  useTheme,
  Card,
  MD3Colors
} from 'react-native-paper'
import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

export default function DoseHistory() {
  const router = useRouter();
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [formattedDateTime, setFormattedDateTime] = useState('');

  // Format the date for display
  const formatDate = (date: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    
    return `${dayName}, ${monthName} ${dayOfMonth}`;
  };

  // Format the time for display
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  // Show date picker
  const showDatePicker = () => {
    setMode('date');
    setDatePickerVisible(true);
  };

  // Show time picker
  const showTimePicker = () => {
    setMode('time');
    setTimePickerVisible(true);
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setSelectedDate(currentDate);
    setDatePickerVisible(false);
    
    // After date is selected, show time picker
    setTimeout(() => {
      showTimePicker();
    }, 500);
  };

  // Handle time change
  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || new Date();
    
    // Combine the previously selected date with the new time
    const updatedDateTime = new Date(selectedDate);
    updatedDateTime.setHours(currentTime.getHours());
    updatedDateTime.setMinutes(currentTime.getMinutes());
    
    setSelectedDate(updatedDateTime);
    setTimePickerVisible(false);
    
    // Format and display the selected date and time
    setFormattedDateTime(`${formatDate(updatedDateTime)} ${formatTime(updatedDateTime)}`);
    
    // Navigate to DoseHistoryView with the selected date and time
    setTimeout(() => {
      // This would typically use navigation, but since we're working with components
      // you'd need to implement how to show the DoseHistoryView in your app
      // For example, you might use a state variable to switch between views
      
      // For demonstration, we can use router to navigate to a page that shows DoseHistoryView
      // or use a callback function that was passed to this component
      
      // Assuming there's a parent component that manages state:
      // if (onDateTimeSelected) {
      //   onDateTimeSelected(updatedDateTime);
      // }
      
      // Or if using navigation:
      router.push({
        pathname: '/dose-history-view',
        params: {
          date: updatedDateTime.toLocaleDateString(),
          startTime: formatTime(updatedDateTime),
          endTime: formatTime(updatedDateTime)
        }
      });
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <IconButton
          icon="arrow-back"
          iconColor="#31435E"
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>Dose Graph History</Text>
        <View style={styles.placeholder} />
      </Surface>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Card style={styles.card} elevation={0}>
          <Card.Content>
            <View style={styles.datePickerContainer}>
              <Text variant="bodyLarge" style={styles.datePickerLabel}>Select Date:</Text>
              <TouchableOpacity style={styles.datePicker} onPress={showDatePicker}>
                <Text variant="bodyMedium" style={styles.datePickerText}>
                  {formattedDateTime || 'Select a date'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Empty state message */}
        <Card style={styles.emptyStateCard}>
          <Card.Content style={styles.emptyStateContainer}>
            <Text variant="bodyLarge" style={styles.emptyStateText}>
              Select date day-wise to see custom Data
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Date Picker Modal */}
      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Time Picker Modal */}
      {timePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background instead of pinkish
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF', // White background instead of blue
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#31435E', // Apply the primary blue color to text
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // Ensure card background is white
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  datePickerContainer: {
    marginVertical: 8,
  },
  datePickerLabel: {
    marginBottom: 8,
    color: '#1F2937',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    color: '#666',
  },
  emptyStateCard: {
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: '#FFFFFF', // Ensure empty state card background is white
  },
  emptyStateContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  emptyStateText: {
    color: '#666',
    textAlign: 'center',
  },
});