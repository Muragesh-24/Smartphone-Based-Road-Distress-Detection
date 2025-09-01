import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";

const baseURL = "https://backend-roaddamage.onrender.com";

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

        const res = await fetch(`${baseURL}/user/gethistory/${userId}`);
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
      <Text style={styles.title}>📝 {item.statement}</Text>
      {item.pdf_url ? (
        <TouchableOpacity
          style={styles.pdfButton}
          onPress={() => openPDF(`${baseURL}/${item.pdf_url}`)}
        >
          <Text style={styles.pdfButtonText}>📄 View Report</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noPdf}>No PDF available</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📜 Your Reports</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : history.length === 0 ? (
        <Text style={styles.emptyText}>No reports yet. Create one to get started!</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#222",
  },
  item: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  pdfButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  pdfButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  noPdf: {
    marginTop: 6,
    fontSize: 13,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});
