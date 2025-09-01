import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, Linking, StyleSheet, Modal, ScrollView } from "react-native";

export default function AdminDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const BASE_URL="https://backend-roaddamage.onrender.com";

  useEffect(() => {
    fetch(`${BASE_URL}/admin/getall`)
      .then((res) => res.json())
      .then((data) => setReports(data.reports))
      .catch((err) => console.error("Error fetching reports:", err));
  }, []);

  const openPDF = (url: string) => {
    Linking.openURL(url);
  };

  const renderReportCard = ({ item }: { item: any }) => {
    const previewImage = item.images_url?.split(",")[0];

    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedReport(item)}>
        {previewImage && <Image source={{ uri: previewImage }} style={styles.thumbnail} />}
        <View style={styles.info}>
          <Text style={styles.statement}>{item.statement}</Text>
          <Text>User: {item.user?.username || item.user_id}</Text>
          <Text>Lat: {item.latitude.toFixed(4)} | Lng: {item.longitude.toFixed(4)}</Text>
          {/* <Text>Status: {item.verified ? "✅ Verified" : "❌ Pending"}</Text> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => String(item.id)}
      />

      {/* Modal for detailed report */}
      <Modal visible={!!selectedReport} animationType="slide" onRequestClose={() => setSelectedReport(null)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Report Details</Text>
          <ScrollView>
            
          {(selectedReport?.images_url?.split(",").filter(Boolean) ?? []).map((url : string, idx : number) => (
  <Image 
    key={idx} 
    source={{ uri: url.trim() }} 
    style={styles.fullImage} 
  />
))}

          </ScrollView>
          {selectedReport?.pdf_url ? (
<TouchableOpacity
  style={styles.pdfButton}
  onPress={() =>
    openPDF(`${BASE_URL}/${selectedReport.pdf_url}`)
  }
>
  
  <Text style={styles.pdfButtonText}>{selectedReport.pdf_url}</Text>
</TouchableOpacity>

          ) : (
            <Text>No PDF uploaded</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedReport(null)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  thumbnail: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  info: { flex: 1, justifyContent: "center" },
  statement: { fontWeight: "bold", marginBottom: 5 },
  modalContainer: { flex: 1, padding: 15, backgroundColor: "#fff" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  fullImage: { width: "100%", height: 200, resizeMode: "cover", marginBottom: 10, borderRadius: 10 },
  pdfButton: {
    marginVertical: 15,
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pdfButtonText: { color: "#fff", fontWeight: "bold" },
  closeButton: { marginTop: 10, padding: 12, backgroundColor: "#dc3545", borderRadius: 8, alignItems: "center" },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});
