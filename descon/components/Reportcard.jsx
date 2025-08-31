import { View, Text, StyleSheet } from "react-native";

export default function ReportCard({ title, distance, status }) {
  const isOpen = status === "Open";

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.badge, isOpen ? styles.open : styles.closed]}>
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      {/* Distance */}
      <Text style={styles.cardText}>📍 {distance} away</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3, // Android shadow
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    flex: 1,
    marginRight: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  open: {
    backgroundColor: "#4CAF50",
  },
  closed: {
    backgroundColor: "#F44336",
  },
});
