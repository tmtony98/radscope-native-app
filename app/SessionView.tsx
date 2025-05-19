import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Platform } from "react-native";
import {
  getSessionFilesByDateRange,
  readSessionFile,
  groupSessionFilesByName,
  SessionFile,
} from "../utils/SessionFileUtils";
import Share from "react-native-share";
import Header from "@/components/Header";
import Button from "@/components/Button";
import FileViewer from "react-native-file-viewer";
import Toast from "react-native-toast-message";
import { text } from "@nozbe/watermelondb/decorators";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SessionView = () => {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<Record<string, SessionFile[]>>({});
  
  // Modal and data states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSessionData, setCurrentSessionData] = useState<any[]>([]);
  const [currentSessionName, setCurrentSessionName] = useState("");

  // Date filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const insets = useSafeAreaInsets();

  // Load session files based on current date range
  const loadSessionFiles = async () => {
    try {
      setIsLoading(true);
      const files = await getSessionFilesByDateRange(dateRange.startDate, dateRange.endDate);
      setSessionFiles(files);
      
      // Group files by session name
      const grouped = groupSessionFilesByName(files);
      setGroupedSessions(grouped);
    } catch (error) {
      console.error("Error loading session files:", error);
      Alert.alert("Error", "Failed to load session files");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSessionFiles();
  }, []);

  const resetFilters = () => {
    setIsFilterActive(false);
    setDateRange({
      startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
      endDate: new Date(),
    });
    // Clear the session files and grouped sessions instead of loading new ones
    setSessionFiles([]);
    setGroupedSessions({});
    setSearchText("");
    loadSessionFiles();
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
      setDateRange((prev) => ({
        ...prev,
        endDate: selectedDate
      }));
      // Don't auto-apply filter
    }
  };

  // Apply date filter only when button is clicked
  const applyDateFilter = () => {
    setIsFilterActive(true);
    loadSessionFiles();
  };

  const handleViewDetails = async (sessionFile: SessionFile) => {
    try {
      setIsLoading(true);

      // Open the file with the device's default app instead of reading it in-app
      await FileViewer.open(sessionFile.path, {
        showOpenWithDialog: true, // Show the "Open with" dialog on Android
        showAppsSuggestions: true, // Show app suggestions on iOS
      });

      console.log("Opening file in external viewer:", sessionFile.path);

      // We're not using the modal anymore, so no need to update related state
    } catch (error) {
      console.log(
        "Error opening session file, maybe jsonl its unsupported in certan devices:",
        error
      );
      Toast.show( { 
        type:"error",
        text1: "Failed to open",
        text2:"The file may be too large or in an unsupported format",
       
         position: "bottom", visibilityTime: 3000 });
      // Alert.alert("Error", "Failed to open session file. The file may be too large or in an unsupported format.");
    } finally {
      setIsLoading(false);
    }
  };


  // Render a session group (all files for a single session name)
  const renderSessionGroup = ({ item }: { item: [string, SessionFile[]] }) => {
    const [sessionName, files] = item;
    const firstFile = files[0]; // Use the first file for display info
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const formattedSize = (totalSize / 1024).toFixed(1) + " KB";
    
    // Share file function
    const shareFile = async (filePath: string) => {
      try {
        const options = {
          url: 'file://' + filePath,
          type: 'application/json',
        };
        
        await Share.open(options);
      } catch (error) {
        console.log('Error sharing file:', error);
        // Alert.alert('Error', 'Failed to share file');
      }
    };

    return (
      <>
        <View
          style={[
            CARD_STYLE.containerList,
            { marginVertical: SPACING.xs, marginHorizontal: SPACING.xs },
          ]}
        >
          <View style={styles.detailsContainer}>
            <View style={styles.mainText}>
              <Text style={[TYPOGRAPHY.TitleLarge, styles.detailText]}>
                {sessionName}
              </Text>
              {/* <Text style={[TYPOGRAPHY.smallText ]}>
              File Size
            </Text> */}
              <Text style={[TYPOGRAPHY.smallText]}>{formattedSize}</Text>
            </View>
            <View style={styles.timings}>
              <View style={styles.detail}>
                <Text style={styles.detailText}>
                  {firstFile.date.toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={BUTTON_STYLE.outLinedBtn}
              onPress={() => shareFile(firstFile.path)}
            >
              <MaterialIcons
                name="download"
                size={20}
                color={COLORS.primary}
                style={styles.buttonIcon}
              />
              <Text style={styles.downloadButtonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={BUTTON_STYLE.mediumButton}
              onPress={() => handleViewDetails(firstFile)}
            >
              <MaterialIcons
                name="visibility"
                size={20}
                color={COLORS.white}
                style={styles.buttonIcon}
              />

              {/* <Ionicons name="eye-outline" size={16} color={COLORS.white} style={styles.buttonIcon} /> */}
              <Text style={BUTTON_STYLE.smallButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  // Filter sessions by search text
  const filteredSessions = Object.entries(groupedSessions).filter(
    ([sessionName, _]) =>
      sessionName.toLowerCase().includes(searchText.toLowerCase())
  );

  // Create a header component for the FlatList that includes the search and date filter
  const renderListHeader = () => (
    <>
      {/* Date Filter Section */}
      <SafeAreaView
        style={[
          CARD_STYLE.container,
          { marginTop: SPACING.md, marginBottom: SPACING.sm },
        ]}
      >
        <Text style={[TYPOGRAPHY.headLineSmall, { marginBottom: SPACING.md }]}>
          Filter by Date Range
        </Text>

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
              <MaterialIcons name="event" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.datePickersRow}>
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
              <MaterialIcons name="event" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Actions */}
        <View style={styles.filterActions}>
          <TouchableOpacity
            style={BUTTON_STYLE.outLinedBtn}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={BUTTON_STYLE.mediumButton}
            onPress={applyDateFilter}
          >
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <StyledTextInput
          label="Search by session name"
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search sessions..."
          value={searchText}
          onChangeText={setSearchText}
          autoCorrect={false}
          autoCapitalize="none"
          leftIcon={
            <MaterialIcons name="search" size={24} color={COLORS.primary} />
          }
        />
      </View>

      {/* Filter Indicator */}
      {isFilterActive && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            Filtered: {dateRange.startDate.toLocaleDateString()} -{" "}
            {dateRange.endDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      )}

      {/* Sessions List with Header Components */}
      {!isLoading && (
        <FlatList
          style={styles.listContentContainer}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: SPACING.md,
            paddingBottom: insets.bottom, // Dynamic bottom padding
          }}
          data={filteredSessions}
          renderItem={renderSessionGroup}
          keyExtractor={([sessionName]) => sessionName}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={TYPOGRAPHY.bodyTextMedium}>
                {isFilterActive
                  ? "No sessions found for the selected date range."
                  : "No sessions found. Try adjusting your search or filters."}
              </Text>
            </View>
          }
        />
      )}

      {/* Date Pickers - Separate implementation for each picker */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={dateRange.startDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartDateChange}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={dateRange.endDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndDateChange}
        />
      )}
    </SafeAreaView>
  );
};

export default SessionView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
     paddingBottom: 50 
  },
  searchContainer: {
    // paddingHorizontal:SPACING.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContentContainer: {
    flex: 1,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  mainText: {
    flex: 0,
  },
  timings: {
    flex: 1,
    alignItems: "flex-end",
  },
  detail: {
    alignItems: "flex-end",
  },
  detailText: {
    color: COLORS.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: SPACING.sm,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  downloadButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  downloadButtonText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.primary,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    marginRight: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  datePickerWrapper: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  datePickerLabel: {
    ...TYPOGRAPHY.TitleMedium,
    color: COLORS.text,
    marginBottom: 4,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  datePickerText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.text,
  },
  filterActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  resetButton: {
    padding: SPACING.sm,
    marginRight: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    minWidth: 100,
  },
  resetButtonText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.text,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  applyButtonText: {
    ...TYPOGRAPHY.bodyTextMedium,
    color: COLORS.white,
  },
  filterIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    padding: 8,
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  filterText: {
    ...TYPOGRAPHY.smallText,
    color: COLORS.text,
  },
});
