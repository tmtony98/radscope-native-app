import { View, StyleSheet, ScrollView, Dimensions, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { COLORS, SPACING, TYPOGRAPHY, CARD_STYLE } from "../../Themes/theme";
import {
  Text,
  Surface,
  IconButton,
  Card,
  Divider,
  MD3Colors,
} from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { Q } from "@nozbe/watermelondb";
import database from "@/index.native";

type DoseHistoryViewProps = {
  date?: string;
  startTime?: string;
  // endTime?: string;
  // selectedDateTime?: Date;
};

// const doseRateArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// const timestampArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function DoseHistoryView({
  date,
  startTime,
}: DoseHistoryViewProps) {
  // console.log("dateeeee", date);
  // console.log("startTimeeeeeeee", startTime);
  // console.log("Raw startTime string received:", startTime);

  // const date = "16/4/2025";
  // const time = "7:10 PM";

  const router = useRouter();

  const [doseRateGraphArray, setDoseRateGraphArray] = useState<any[]>([]);
  const [doseRateValues, setDoseRateValues] = useState<any[]>([]);
  const [timeLabels, setTimeLabels] = useState<any[]>([]);

  const getDoseRateArray = async (startDate: string, startTime: string) => {
    const [day, month, year] = startDate.split("/").map(Number); // e.g., "18/04/2025"

    if (!startTime) {
      console.warn("startTime is undefined");
      return [];
    }

    // Parse time (handling AM/PM format)
    let [timePart, modifier] = startTime.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // Create the Date object using the parsed date and time (no UTC conversion)
    const dateObj = new Date(year, month - 1, day, hours, minutes); // Local time, no offset

    // Log the start timestamp in unix format
    const startTimestamp = dateObj.getTime();

    // console.log("startTimestamp converted to unix timestamp", startTimestamp);
    // console.log("startTimestamp converting before to unix", "startDate: " + startDate + " startTime: " + startTime);

    // Check for invalid timestamps
    if (isNaN(startTimestamp)) {
      console.warn("Invalid date/time format");
      return [];
    }

    const endTimestamp = startTimestamp + 10 * 60 * 1000; // 10 minutes later

    const doseRateArray = await database
      .get("doserate")
      .query(
        Q.where("createdAt", Q.gte(startTimestamp)),
        Q.where("createdAt", Q.lte(endTimestamp)),
        Q.sortBy("createdAt", Q.desc)
      )
      .fetch();

    console.log(
      "graphArray:",
      doseRateArray,
      "startDate:",
      new Date(startTimestamp).toLocaleString(),
      "endDate:",
      new Date(endTimestamp).toLocaleString()
    );

    return doseRateArray;
  };

  useEffect(() => {
    const fetchDoseRateArray = async () => {
      if (date && startTime) {
        const data = await getDoseRateArray(date, startTime);
        const graphArray = data.map((item) => item._raw);
        setDoseRateGraphArray(graphArray);
        setDoseRateValues(graphArray.map((item) => item.doserate));
        setTimeLabels(graphArray.map((item) => item.createdAt));
      }
    };
    fetchDoseRateArray();
  }, [date, startTime]);

  //get the latest 10 values
  //const DoseRateLabels = doseRateValues.slice(-10);
  // const TimeLabels = timeLabels.slice(-10);
  // console.log("DoseRateLabels", DoseRateLabels);

  // Mock data for the graph

  // Mock data for the graph
  // const graphData = {
  //   labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  //   datasets: [
  //     {
  //       data: [
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100,
  //         Math.random() * 100
  //       ],
  //       color: (opacity = 1) => `rgba(71, 92, 119, ${opacity})`, // Dark blue color
  //       strokeWidth: 2
  //     }
  //   ],
  //   legend: ["Dose Rate"]
  // };

  // Format date as shown in the UI
  // const formatSelectedDate = () => {
  //   const formattedDate = selectedDateTime.toLocaleDateString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     year: 'numeric'
  //   });

  //   const formattedTime = selectedDateTime.toLocaleTimeString('en-US', {
  //     hour: 'numeric',
  //     minute: '2-digit',
  //     hour12: true
  //   });

  //   return `${formattedTime}`;
  // };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      {/* Date Selection */}
      <View style={styles.card}>
        <View style={styles.dateContainer}>
          <Text style={TYPOGRAPHY.TitleMedium}>Select Date</Text>
          <View style={styles.dateValue}>
            <Text style={styles.dateText}>
              {startTime} - {date}
            </Text>
            <IconButton
              icon="calendar"
              size={20}
              onPress={() => router.back()}
              style={styles.calendarIcon}
            />
          </View>
        </View>
      </View>

      {/* Dose Rate Graph */}

      {doseRateValues.length > 0 && timeLabels.length > 0 ? (
        <View>
          <LineChart
            data={{
              labels: timeLabels,
              datasets: [
                {
                  data: doseRateValues,
                },
              ],
            }}
            width={Dimensions.get("window").width - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(14, 23, 37, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            bezier
            style={{
              marginVertical: 0,
              borderRadius: 10,
            }}
          />
        </View>
      ) : (
        <View style={CARD_STYLE.container}>
          <Text style={TYPOGRAPHY.smallText} >No data on selected Date And Time</Text>
        </View>
      )}

      {/* Graph Parameters */}
      <View style={CARD_STYLE.container}>
        <Text  style={TYPOGRAPHY.headLineSmall}>
          Graph Parameters
        </Text>

        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>Start Time</Text>
          <Text style={TYPOGRAPHY.TitleMedium}>
            {startTime ? startTime.toLocaleString() : "-"}
          </Text>
        </View>

        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>Date</Text>
          <Text style={TYPOGRAPHY.TitleMedium}>
            {date ? date.toLocaleString() : "-"}
          </Text>
        </View>

       
        
        <View style={styles.paramRow}>
          <Text style={TYPOGRAPHY.TitleMedium}>End Time</Text>
          {/* <Text style={styles.paramValue}>{endTime}</Text> */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#31435E",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48,
  },
  card: {
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
  },
  dateLabel: {
    color: "#333",
  },
  dateValue: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    color: "#333",
  },
  calendarIcon: {
    margin: 0,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  graphContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  graph: {
    marginVertical: 8,
    borderRadius: 16,
  },
  graphSubtitle: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
    marginTop: 8,
  },
  paramRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  paramLabel: {
    fontSize: 16,
    color: "#333",
  },
  paramValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  divider: {
    backgroundColor: "#E5E5E5",
  },
  chartPlaceholder: {
    height: 250,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    // borderColor: COLORS.border,
    // borderStyle: 'solid',
  },
});
