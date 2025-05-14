import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import database from "@/index.native";
import Sessions from "@/model/Sessions";
import {
  CARD_STYLE,
  BUTTON_STYLE,
  TYPOGRAPHY,
  COLORS,
  SPACING,
} from "@/Themes/theme"; // Import theme styles
import { useMqttContext } from "@/Provider/MqttContext";
import StyledTextInput from "@/components/common/StyledTextInput";
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';

type Session = {
  id: string;
  sessionName: string;
  createdAt: number;
  stoppedAt?: number; // Make stoppedAt optional if it might not exist
};

export default function SessionView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Date filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const resetFilters = () => {
    setIsFilterActive(false);
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    });
  };

  // Handle date selection for start date - don't auto-apply filter
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false); // Always hide picker after selection
    
    if (selectedDate) {
      setDateRange(prev => ({
        ...prev,
        startDate: selectedDate
      }));
      // Don't auto-apply filter
    }
  };
  
  // Handle date selection for end date - don't auto-apply filter
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false); // Always hide picker after selection
    
    if (selectedDate) {
      setDateRange(prev => ({
        ...prev,
        endDate: selectedDate
      }));
      // Don't auto-apply filter
    }
  };

  // Apply date filter only when button is clicked
  const applyDateFilter = () => {
    setIsFilterActive(true);
  };

  // const queryAndLogSessions = async () => {
  //   try {
  //     // Uncomment when ready to fetch real data
  //     const sessions = await database.get<Sessions>("sessions").query().fetch();
  //     setSessions(sessions);
  //   } catch (error) {
  //     console.error("Failed to query sessions:", error);
  //   }
  // };

  // useEffect(() => {
  //   queryAndLogSessions();
  // }, []);

  const handleViewDetails = (sessionId: string) => {
    console.log("View details for session:", sessionId);
    // Add navigation or other actions here
  };

  const renderSessionItem = ({ item }: { item: Session }) => (
    <View style={[CARD_STYLE.containerList, { marginVertical: SPACING.xs, marginHorizontal: SPACING.xs}]}>
      <View style={styles.detailsContainer}>
        <View style={styles.mainText}>
          <Text style={[TYPOGRAPHY.TitleMedium, styles.detailText]}>
            Name: {item.sessionName}
          </Text>
          <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
            ID: {item.id}
          </Text>
        </View>
        <View style={styles.timings}>
          <View style={styles.detail}>
            <Text style={styles.detailText}>
              Created 
            </Text>
            <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>

          <View style={styles.detail}>
            <Text style={styles.detailText}>
              Stopped{" "}
            </Text>
            <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
              {item.stoppedAt ? new Date(item.stoppedAt).toLocaleString() : "N/A"}
            </Text>
          </View>
        </View>
      </View>
      <View style={{width:"100%", alignItems:"center"}}>
        <TouchableOpacity
          style={[BUTTON_STYLE.smallButton, styles.detailsButton]}
          onPress={() => handleViewDetails(item.id)}
        >
          <Text style={BUTTON_STYLE.smallButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredSessions = sessions.filter((session) => {
    // Filter by search text
    const matchesSearch = session.sessionName
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    
    // Filter by date range if filter is active
    let matchesDateRange = true;
    if (isFilterActive) {
      const sessionDate = new Date(session.createdAt);
      // Set hours to 0 to compare dates only
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      matchesDateRange = sessionDate >= startDate && sessionDate <= endDate;
    }
    
    return matchesSearch && matchesDateRange;
  });

  return (
    <View style={styles.container }>
      {/* Search and Filter Section */}
      {/* <View style={styles.searchContainer}>
        <StyledTextInput
          label="Search by session name"
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search sessions..."
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View> */}
      
      {/* Date Filter Section */}
      <View style={[CARD_STYLE.container, { marginHorizontal: SPACING.md }]}>
        <Text style={[TYPOGRAPHY.TitleMedium, { marginBottom: SPACING.md }]}>Filter by Date Range</Text>
        
        <View style={styles.datePickersRow}>
          {/* Start Date Picker */}
          <View style={styles.datePickerWrapper}>
            <Text style={styles.datePickerLabel}>Start Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {dateRange.startDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {/* End Date Picker */}
          <View style={styles.datePickerWrapper}>
            <Text style={styles.datePickerLabel}>End Date</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {dateRange.endDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter Actions */}
        <View style={styles.filterActions}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={applyDateFilter}
          >
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filter Indicator */}
      {isFilterActive && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            Filtered: {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Sessions List */}
      <FlatList
        style={styles.listContentContainer}
        data={filteredSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>No sessions found.</Text>
          </View>
        }
      />
      
      {/* Date Pickers - Separate implementation for each picker */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={dateRange.startDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? "spinner" : "default"}
          onChange={handleStartDateChange}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={dateRange.endDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? "spinner" : "default"}
          onChange={handleEndDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    marginTop: 20,
    paddingHorizontal: SPACING.md,
  },
  dateFilterContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateFilterTitle: {
    ...TYPOGRAPHY.bodyTextMedium,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  datePickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  datePickerWrapper: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  datePickerLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#edf2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5eb',
  },
  filterText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  listContentContainer: {
    padding: SPACING.xs,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  detailsContainer: {
    padding: SPACING.xs,
    width: "100%",
  },
  mainText: {
    marginBottom: SPACING.xs,
  },
  detailText: {
    marginBottom: 4,
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  timings: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  detailsButton: {
    marginTop: SPACING.xs,
    width: "80%",
  },
  searchInput: {
    marginRight: SPACING.xs,
  },
});