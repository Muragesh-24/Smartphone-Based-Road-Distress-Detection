import React from 'react';
import { Button, View } from 'react-native';
import { Document, Page, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const styles = StyleSheet.create({
  page: { padding: 30 },
  text: { marginBottom: 10, fontSize: 12 },
  image: { width: 200, height: 150, marginVertical: 5 },
});

export default function Pdfhandler() {
  const text = "Your 300 words text here...";
  const images = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
  ];


  const generatePDF = async () => {
    const pdfBlob = await pdf(<MyDocument />).toBlob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64data = reader.result.split(",")[1]; // base64 string
        const fileUri = FileSystem.documentDirectory + "report.pdf";

        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        resolve(fileUri);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  };

  // Upload PDF to backend
  const handleReport = async () => {
    try {
      const fileUri = await generatePDF();

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: "report.pdf",
        type: "application/pdf",
      });

      const response = await fetch("https://your-backend.com/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      console.log("Uploaded:", result);
    } catch (err) {
      console.log(err);
    }
  };

  // Download/Share PDF
  const handleDownload = async () => {
    try {
      const fileUri = await generatePDF();
      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Report It" onPress={handleReport} />
      <View style={{ height: 20 }} />
      <Button title="Download" onPress={handleDownload} />
    </View>
  );
}
