import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";


const baseURL = "https://backend-roaddamage.onrender.com" ;
export default function Reports() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const openPDF = (url: string) => {
    Linking.openURL(url);
  };
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) return;
  
      
        const res = await fetch(
          `${baseURL}/user/gethistory/${userId}`
      
        );
        const data = await res.json();

        if (data.history) {
          setHistory(data.history);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.statement}</Text>
      {/* <Text>📍 {item.latitude}, {item.longitude}</Text> */}
      {/* <Text>✅ Verified: {item.verified ? "Yes" : "No"}</Text> */}

    
      {item.pdf_url ? (
        <TouchableOpacity
          style={styles.pdfButton}
           onPress={() =>
    openPDF(`${baseURL}/${item.pdf_url}`)
  }
        >
          <Text style={styles.pdfButtonText}>📄 View PDF</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your History</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  pdfButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  pdfButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
