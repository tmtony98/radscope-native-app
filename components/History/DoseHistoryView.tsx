import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { COLORS, SPACING, TYPOGRAPHY } from '../../Themes/theme'
import { 
  Text, 
  Surface, 
  IconButton, 
  Card,
  Divider,
  MD3Colors,
} from 'react-native-paper'
import { LineChart } from 'react-native-chart-kit'

type DoseHistoryViewProps = {
  date?: string;
  startTime?: string;
  endTime?: string;
  selectedDateTime?: Date;
}

export default function DoseHistoryView({ 
  date = '4/27/2024', 
  startTime = '11:30 AM', 
  endTime = '11:30 AM', 
  selectedDateTime = new Date()
}: DoseHistoryViewProps) {
  const router = useRouter();
  
  // Mock data for the graph
  const graphData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        data: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ],
        color: (opacity = 1) => `rgba(71, 92, 119, ${opacity})`, // Dark blue color
        strokeWidth: 2
      }
    ],
    legend: ["Dose Rate"]
  };
  
  // Format date as shown in the UI
  const formatSelectedDate = () => {
    const formattedDate = selectedDateTime.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = selectedDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedTime}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <IconButton
          icon="arrow-back"
          iconColor={MD3Colors.neutral0}
          size={24}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>Dose Graph History</Text>
        <View style={styles.placeholder} />
      </Surface>
      
      {/* Date Selection */}
      <Card style={styles.card} elevation={0}>
        <Card.Content style={styles.dateContainer}>
          <Text variant="bodyLarge" style={styles.dateLabel}>Select Date:</Text>
          <View style={styles.dateValue}>
            <Text variant="bodyMedium" style={styles.dateText}>
              {formatSelectedDate()}
            </Text>
            <IconButton
              icon="calendar"
              size={20}
              onPress={() => router.back()}
              style={styles.calendarIcon}
            />
          </View>
        </Card.Content>
      </Card>
      
      {/* Dose Rate Graph */}
      <Card style={styles.card} elevation={0}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Dose Rate</Text>
          <View style={styles.graphContainer}>
            <LineChart
              data={graphData}
              width={Dimensions.get('window').width - 50}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(71, 92, 119, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '2',
                  strokeWidth: '1',
                  stroke: '#31435E',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#E5E5E5',
                },
              }}
              bezier
              style={styles.graph}
            />
          </View>
          <Text style={styles.graphSubtitle}>Dose Rate (µSv/h) vs Time (HH:MM:SS)</Text>
        </Card.Content>
      </Card>
      
      {/* Graph Parameters */}
      <Card style={styles.card} elevation={0}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Graph Parameters</Text>
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Date</Text>
            <Text style={styles.paramValue}>{date}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>Start Time</Text>
            <Text style={styles.paramValue}>{startTime}</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.paramRow}>
            <Text style={styles.paramLabel}>End Time</Text>
            <Text style={styles.paramValue}>{endTime}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#31435E',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateLabel: {
    color: '#333',
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    color: '#333',
  },
  calendarIcon: {
    margin: 0,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  graphContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  graphSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  paramLabel: {
    fontSize: 16,
    color: '#333',
  },
  paramValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    backgroundColor: '#E5E5E5',
  },
});