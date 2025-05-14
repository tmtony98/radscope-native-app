import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import Header from "@/components/Header";

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



  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });
  const [tempDateRange, setTempDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateSelection, setCurrentDateSelection] = useState('start');
  const [isFilterActive, setIsFilterActive] = useState(false);

  // useEffect(() => {
  //   filterSessions();
  // }, [searchQuery, dateRange, isFilterActive]);

  const resetFilters = () => {
    setIsFilterActive(false);
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    });
    setTempDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // On Android, this is automatically dismissed, but on iOS we need to handle it
    setDatePickerVisible(Platform.OS === 'ios');
    
    if (selectedDate) {
      setTempDateRange(prev => ({
        ...prev,
        [currentDateSelection === 'start' ? 'startDate' : 'endDate']: selectedDate
      }));
      console.log("tempDateRange",tempDateRange);
      
      // If this is the end date and it's before the start date, adjust it
      if (currentDateSelection === 'end' && selectedDate < tempDateRange.startDate) {
        setTempDateRange(prev => ({
          ...prev,
          startDate: selectedDate
        }));
      }
      
      // If this is the start date and it's after the end date, adjust it
      if (currentDateSelection === 'start' && selectedDate > tempDateRange.endDate) {
        setTempDateRange(prev => ({
          ...prev,
          endDate: selectedDate
        }));
      }
    }
  };

  const applyDateFilter = () => {
    setIsFilterActive(true);
    setDateRange(tempDateRange);
  };

  const showDatePicker = (type: 'start' | 'end') => {
    setCurrentDateSelection(type);
    setDatePickerVisible(true);
  };

  const queryAndLogSessions = async () => {
    try {
      // console.log("Querying sessions from database...");
      // // Ensure you are querying the correct collection name ('sessions')
      // const sessions = await database.get<Sessions>("sessions").query().fetch();
      // setSessions(sessions);
      // console.log("Fetched sessions count:", sessions.length);
      // // Log details of each session
      // sessions.forEach((session) => {
      //   console.log(
      //     `Session - ID: ${session.id}, Name: ${
      //       session.sessionName
      //     }, CreatedAt: ${new Date(session.createdAt)}`
      //   );
      // });
    } catch (error) {
      console.error("Failed to query sessions:", error);
    }
  };

  useEffect(() => {
    queryAndLogSessions();
  }, []);

  const handleViewDetails = (sessionId: string) => {
    console.log("View details for session:", sessionId);
    // Add navigation or other actions here
  };

  const renderSessionItem = ({ item }: { item: Session }) => (
    <View style={[CARD_STYLE.containerList, { marginVertical: SPACING.xs  , marginHorizontal: SPACING.xs}]}>
      <View style={styles.detailsContainer}>
        <View  style={styles.mainText} >
          <Text style={[TYPOGRAPHY.TitleMedium, styles.detailText]}>
          Name: {item.sessionName}
        </Text>
        <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
          ID: {item.id}
        </Text>
        </View >
       <View style={styles.timings}>
       <View style={styles.detail} >
        <Text style={styles.detailText}>
          Created 
        </Text>
        <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
        {new Date(item.createdAt).toLocaleString()}
        </Text>
        </View>

        <View style={styles.detail} >
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
    const matchesSearch = session.sessionName
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesDate = selectedDate
      ? new Date(session.createdAt).toDateString() ===
        selectedDate.toDateString()
      : true;
    return matchesSearch && matchesDate;
  });

  
  return (
    <View style={styles.container}>
<Header title="Session View" showBackButton={true}  />

      {/* Search Input */}
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
          {/* Date Picker */}

          <TouchableOpacity
  style={styles.dateFilterButton}
  onPress={() => {
    setFilterModalVisible(true); // Open the modal
  }}
>
<Ionicons name="calendar-outline" size={22} color={COLORS.primary} /> 
  <Text style={styles.dateFilterButtonText}>
    
    {isFilterActive ? "Date Filter Active" : "Filter"}
  </Text>
</TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.dateFilterButton}
          onPress={() => {showDatePicker('start');
           
          }}
        >
          <Text style={styles.dateFilterButtonText}>
            {selectedDate
              ? selectedDate.toLocaleDateString()
              : "Filter by Date"}
          </Text>
        </TouchableOpacity> */}
       <Modal
  isVisible={isFilterModalVisible} // Changed from visible to isVisible
  onBackdropPress={() => setFilterModalVisible(false)} // Close on backdrop press
  onBackButtonPress={() => setFilterModalVisible(false)} // Handle back button on Android
  backdropTransitionOutTiming={0} // Fix Android back issues
  style={{ margin: 0 }} // Remove default margin
>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Date</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateSelectionContainer}>
              <Text style={styles.dateSelectionLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.dateSelectionButton}
                onPress={() => showDatePicker('start')}
              >
                <Text style={styles.dateSelectionText}>
                  {tempDateRange.startDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateSelectionContainer}>
              <Text style={styles.dateSelectionLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.dateSelectionButton}
                onPress={() => showDatePicker('end')}
              >
                <Text style={styles.dateSelectionText}>
                  {tempDateRange.endDate.toLocaleDateString()}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalSecondaryButton}
                onPress={resetFilters}
              >
                <Text style={styles.modalSecondaryButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalPrimaryButton}
                onPress={applyDateFilter}
              >
                <Text style={styles.modalPrimaryButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    
      </View>

      {/* Date picker component for selecting dates */}
      {datePickerVisible && (
        <DateTimePicker
          value={currentDateSelection === 'start' ? tempDateRange.startDate : tempDateRange.endDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      
      <FlatList
      style={styles.listContentContainer}
        data={filteredSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        // contentContainerStyle={styles.listContentContainer} // Add padding to the list content
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={TYPOGRAPHY.bodyTextMedium}>No sessions found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
    marginTop: 20,
    paddingHorizontal: SPACING.md,
  },
  dateFilterSection: {
    backgroundColor: COLORS.white,
     marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dateFilterTitle: {
    ...TYPOGRAPHY.TitleMedium,
    color: COLORS.primary,
  },
  resetButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.lightGray,
  },
  resetButtonText: {
    ...TYPOGRAPHY.bodyTextSmall,
    color: COLORS.text,
  },
  dateSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  datePickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  applyFilterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  applyFilterButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Use background color from theme
  },
  listContentContainer: {
    padding: SPACING.xs,
    width: "100%",
  },
  mainText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  detailsContainer: {
    flex: 1,
    padding: SPACING.sm,
  },
  detailsButton: {
    marginTop: SPACING.xs,
  },
  detailText: {
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  searchInput: {
    marginRight: SPACING.xs,
  },
  dateFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  dateFilterButtonText: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 14,
  },
  dateSelectionLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
    fontWeight: '600',
    opacity: 0.8
  },
  dateSelectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateSelectionText: {
    fontSize: 16,
    color: '#333',
  },
});
