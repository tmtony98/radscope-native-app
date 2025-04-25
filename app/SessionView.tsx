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

type Session = {
  id: string;
  sessionName: string;
  createdAt: number;
  stoppedAt?: number; // Make stoppedAt optional if it might not exist
};

export default function SessionView() {

  const [sessions, setSessions] = useState<Session[]>([]);

  const queryAndLogSessions = async () => {
    try {
      console.log("Querying sessions from database...");
      // Ensure you are querying the correct collection name ('sessions')
      const sessions = await database.get<Sessions>("sessions").query().fetch();
      setSessions(sessions);
      console.log("Fetched sessions count:", sessions.length);
      // Log details of each session
      sessions.forEach((session) => {
        console.log(
          `Session - ID: ${session.id}, Name: ${
            session.sessionName
          }, CreatedAt: ${new Date(session.createdAt)}`
        );
      });
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
    <View style={[CARD_STYLE.containerList, styles.itemRow]}>
      <View style={styles.detailsContainer}>
        <Text style={[TYPOGRAPHY.TitleMedium, styles.detailText]}>
          Name: {item.sessionName}
        </Text>
        <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
          ID: {item.id}
        </Text>
        <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
          Created: {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={[TYPOGRAPHY.bodyTextMedium, styles.detailText]}>
          Stopped:{" "}
          {item.stoppedAt ? new Date(item.stoppedAt).toLocaleString() : "N/A"}
        </Text>
      </View>
      <TouchableOpacity
        style={[BUTTON_STYLE.smallButton, styles.detailsButton]}
        onPress={() => handleViewDetails(item.id)}
      >
        <Text style={BUTTON_STYLE.smallButtonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer} // Add padding to the list content
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Use background color from theme
  },
  listContentContainer: {
    padding: SPACING.md, // Add padding around the list
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md, // Add space between cards
  },
  detailsContainer: {
    flex: 1, // Take available space
    marginRight: SPACING.md, // Add space between details and button
  },
  detailText: {
    marginBottom: SPACING.xs, // Add small spacing between text lines
    color: COLORS.text, // Use text color from theme
  },
  detailsButton: {
    // Adjust button style if needed, e.g., width or alignment
    paddingVertical: SPACING.sm, // Smaller vertical padding for small button
    paddingHorizontal: SPACING.md,
    height: "auto", // Adjust height automatically
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xxl,
  },
});
