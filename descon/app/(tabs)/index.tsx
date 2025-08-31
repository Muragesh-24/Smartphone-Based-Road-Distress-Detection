import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import ReportCard from "@/components/Reportcard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import { router } from "expo-router";
// import { WebView } from 'react-native-webview';
import { useState } from "react";

const { width, height } = Dimensions.get("window");
//  const [markers, setMarkers] = useState([]);

// const osmUrl = 'https://www.openstreetmap.org/#map=15/26.5088/80.2285';
export default function HomePage() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Map */}
        {/* <View style={styles.mapBox}>
        
                <WebView source={{ uri: osmUrl }} style={styles.webview} />
        </View> */}

        {/* Create Report Button */}
<TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/(tabs)/report")}
>
          <Text style={styles.buttonText}>➕ Create Report</Text>
        </TouchableOpacity>

        {/* Reports */}
        
        

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
   map: {
    flex: 1,
    backgroundColor:"#000",
    width: '100%',          
    height: '100%', 
  },
 scrollContainer: {
  paddingHorizontal: 20,
  paddingTop: 10,
  backgroundColor:"#fff",
  paddingBottom: 80, // matches footer height
},
webview: { flex: 1 },
  reportsContainer: {
    gap: 12, // modern RN supports gap
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapBox: {
    backgroundColor: "#e6e6e6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: width - 32,
    height: height * 0.25,
    
  },
});
