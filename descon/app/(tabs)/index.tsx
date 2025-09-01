import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";



export default function HomePage() {


  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>
          Create and manage your reports effortlessly.
        </Text>

        {/* Action Section */}
        <View style={styles.centerBox}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/report")}
          >
            <Text style={styles.buttonText}>➕ Create Report</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.helperTitle}>Why Reports?</Text>
          <Text style={styles.helperText}>
           Our platform lets you create detailed, professional PDF reports with a single tap. Powered by advanced machine learning, it automatically analyzes road damage from images or videos, summarizes findings, highlights key statistics, and compiles everything into a structured, government-ready report. Save time, improve accuracy, and share insights seamlessly.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: "700", // use Inter_700Bold if loaded
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "400", // Inter_400Regular
    color: "#475569",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  centerBox: {
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600", // Inter_600SemiBold
    textAlign: "center",
    letterSpacing: 0.6,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    marginTop: 40,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  helperTitle: {
    fontSize: 18,
    fontWeight: "600", // Inter_600SemiBold
    color: "#0f172a",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  helperText: {
    fontSize: 15,
    fontWeight: "400",
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
