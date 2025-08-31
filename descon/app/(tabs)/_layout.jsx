import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import Navbar from "@/components/Navbar";   // <- your navbar
import FloatingFooter from "@/components/Footer"; // <- footer

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        {/* Navbar always at top */}
        <Navbar />

        {/* Main routed screens */}
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {/* Footer always at bottom */}
        <FloatingFooter />
      </SafeAreaView>

      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom:-9,
    backgroundColor: "#111",
  },
  content: {
    flex: 1, // scrollable content takes remaining height
  },
});
