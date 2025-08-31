
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Platform ,Image, Alert} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import * as Location from 'expo-location';
import { AntDesign } from '@expo/vector-icons';
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

 
import PhotoPreviewSection from '@/components/PhotoPreviewsection';
import useCurrentAddress from '@/components/UsecurrentAd';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
// import Pdfhandler from '@/components/PdfHandler';

export default function Report() {
  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  // keep camera ref as any since CameraView typing can be tricky
  const cameraRef = useRef<any>(null);

  // Location
  
  // Detection & frames
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  // useRef for interval id to avoid rerenders
  const intervalRef = useRef<any>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  // Videos
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [processedVideoUri, setProcessedVideoUri] = useState<string | null>(null);
  
  // Photo preview
  const [photo, setPhoto] = useState<any>(null);
  const [finalreport,setFinalreport]=useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [photoreportsUri, setPhotoUri] = useState<string[] | null>(null);
  const [aireport,setAireport]=useState("")
  const[reporturi,setReporturi]=useState("")


useEffect(()=>{
getUserId()



},[])

function buildSimpleReport(photos: string[] | null, aiText: string) {
  const photoFigures = (photos || [])
    .map(
      (src, i) => `
        <figure style="margin:0 0 12px 0; page-break-inside:avoid;">
          <img src="http://172.23.35.151:5000${src}" style="width:100%; border:1px solid #ccc; border-radius:6px;" />
          <figcaption style="font-size:10px; color:#555; text-align:center;">
            Photo ${i + 1}
          </figcaption>
        </figure>`
    )
    .join("");

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Inspection Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color:#111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; border-bottom:1px solid #ddd; }
        p { margin: 0 0 10px 0; }
      </style>
    </head>
    <body>
      <h1>Inspection Report</h1>
      <p>Date: ${new Date().toLocaleString()}</p>

      <h2>AI Analysis</h2>
      <p style="white-space: pre-wrap;">${aiText || "No AI report provided."}</p>

      <h2>Photo Evidence</h2>
      ${photoFigures || "<p>No photos attached.</p>"}
    </body>
  </html>
  `;
}


const getUserId = async () => {
  try {
    const id = await AsyncStorage.getItem("user_id");
    if (id !== null) {

  
    } else {
   Alert.alert("Auth required","Please signin before reporting")
   router.push("/(tabs)/auth")
    }
  } catch (err) {
    console.error("Error reading user_id:", err);
  }
};



  // Unique key per video/session
  const userKey = 'hello'; // generate per session if needed
const generateLocalReport = () => {
  const counts: Record<string, number> = {};
  detections.forEach(d => {
    counts[d.name] = (counts[d.name] || 0) + 1;
  });




  let report = `Local Report:\n- Total detections: ${detections.length}\n`;
  report += `- Counts by type:\n`;
  for (const [name, count] of Object.entries(counts)) {
    report += `  - ${name}: ${count}\n`;
  }
  setFinalreport(report)
  alert("done")
  return report
};

// call this after stopping detection instead of fetching from backend


  const generatePDF = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildSimpleReport(photoreportsUri, aireport)
      });

      console.log("PDF generated at:", uri);


      setReporturi(uri)
     
    } catch (error) {
      console.error("Error creating PDF:", error);
    }
  };


  const sharepdf =async()=>{
await generatePDF()

     await shareAsync(reporturi, {
        dialogTitle: "Share your PDF",
      });
  }

const getAddressFromCoords = async (lat: number, lng: number) => {
  try {
    let result = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (result.length > 0) {
      const place = result[0];
      return `${place.name}, ${place.street}, ${place.city}, ${place.region}, ${place.country}`;
    }
    return "Unknown location";
  } catch (err) {
    console.error("Error in reverse geocoding:", err);
    return "Unknown location";
  }
};


const sendChatRequest = async (report : string 
) => {
  try {
    
    if (!report ) {
      alert("Missing data for AI report!");
      return;
    }

    const payload = {
      report,
      // location: {
      //   lat: location.coords.latitude,
      //   lng: location.coords.longitude,
      // }
    };

    const res = await fetch("http://172.23.35.151:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("AI Response:", data.reply);
    setAireport(data.reply);
  } catch (err) {
    console.error("Error sending chat:", err);
  }
};

const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;
  const loc = await Location.getCurrentPositionAsync({});
  setLocation(loc);
  console.log('Current location:', loc);
};

const baseURL = "http://172.23.35.151:5000/";

const prefixedImages = (photoreportsUri || []).map(
  (img) => `${baseURL}${img}`
);

const ReportHandler = async () => {
  try {
 
    // const loc = await Location.getCurrentPositionAsync({});
    const html = buildSimpleReport(photoreportsUri, aireport);
    const { uri } = await Print.printToFileAsync({ html });

    const userId = await AsyncStorage.getItem("user_id");

  const formData = new FormData();
formData.append("user_id", String(userId));
formData.append("images_url", prefixedImages.join(","));
formData.append("latitude", String(location?.coords.latitude));
formData.append("longitude", String(location?.coords.longitude));
formData.append("statement", "Detected road damage");

// attach PDF file
formData.append("pdf", {
  uri: uri,
  type: "application/pdf",
  name: "report.pdf",
} as any);
 
Alert.alert(reporturi)
    await fetch("https://backend-roaddamage.onrender.com/user/report", {
      method: "POST",
    
 body: formData,
  headers: {
        "Accept": "application/json",
        "Content-Type": "multipart/form-data",
      },
     
    });
  } catch (err) {
    console.error("ReportHandler error:", err);
  }
};









  /** GET LOCATION **/

  /** CAPTURE FRAME AND SEND TO BACKEND (file, not base64) **/
const captureFrame = async () => {
  if (!cameraRef.current || !location) return;

  getLocation()
  try {
    const pic = await cameraRef.current.takePictureAsync({ base64: false });

  
    const response = await fetch(pic.uri);
  

    const formData = new FormData();
  type RNFile = {
  uri: string;
  type: string;
  name: string;
};

const file: RNFile = {
  uri: pic.uri,
  name: "frame.jpg",
  type: "image/jpeg",
};

formData.append("image", file as any);
    formData.append("key", "hello");                  // user key
    formData.append("latitude", location.coords.latitude.toString());  // latitude
    formData.append("longitude", location.coords.longitude.toString()); // longitude

    const res = await fetch("http://172.23.35.151:5000/detect-frame", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();


    
    const parsedDetections = data.detections ? JSON.parse(data.detections) : [];
    setDetections(prev => [...prev, ...parsedDetections]);

setPhotoUri(prev => {
  const updated = [...(prev || []), data.image_url];
  console.log('Updated array:', updated);
  return updated;
});






  } catch (err) {
    console.log("Error sending frame:", err);
  }
};


  /** START/STOP LIVE DETECTION **/
  const startDetection = async () => {
    await getLocation();
    setIsDetecting(true);
  };
const stopDetectionAndGetReport = async () => {
  setIsDetecting(false);

  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }


  // wait 5 seconds before fetching the report
 
  setTimeout(async () => {
   const report = await generateLocalReport();
   if (location) {
      sendChatRequest(report); // pass directly
    } else {
      await getLocation(); // ensure location fetched
      if (location) sendChatRequest(report);
    }
  }, 5000); // 5000ms = 5 seconds
};
// 

const pickVideo = async (fromCamera = false) => {
  try {
    let result;

    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      });
    }

    // check if user picked a video
    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      console.log("Picked video URI:", uri);

      setVideoUri(uri); // store in state if needed
      await uploadVideo(uri); // upload directly using FormData
    } else {
      console.log("No video selected");
    }
  } catch (err) {
    console.log("Error picking video:", err);
  }
};

const uploadVideo = async (uri: string) => {
  if (!uri) return;

  try {
    const formData = new FormData();
    formData.append("key", userKey); // your user identifier
    formData.append("video", {
      uri,                 // the local URI
     name: uri.split("/").pop(),  // filename for backend
      type: "video/mp4",   // mime type
    } as any);

    const res = await fetch("http://172.23.35.151:5000/upload-video", {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
        "Content-Type": "multipart/form-data",
      },
      // DO NOT set Content-Type manually; let fetch handle it
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn("Upload failed:", res.status, txt);
      return;
    }

    const data = await res.json();


// merge detections
const parsedDetections = (data.detections || []).flatMap((str:string )=> {
  try {
    return JSON.parse(str);
  } catch (e) {
    return [];
  }
});

setDetections(prev => [...prev, ...parsedDetections]);



// merge annotated images
setPhotoUri(prev => {
  const updated = [...(prev || []), ...(data.annotated_frames || [])];

 const report = generateLocalReport()
sendChatRequest(report)
  console.log('Updated array:', updated);
  return updated;
});
  } catch (err) {
    console.log("Error uploading video:", err);
  }
};
const place =useCurrentAddress()
  /** CAMERA CONTROLS **/
  const toggleCameraFacing = () => setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    // take a photo and show preview (no base64)
    const takenPhoto = await cameraRef.current.takePictureAsync();
    setPhoto(takenPhoto);
  };
  const handleRetakePhoto = () => setPhoto(null);

  /** FPS INTERVAL **/
  useEffect(() => {
    if (isDetecting) {
      // start capturing every 5s
      intervalRef.current = setInterval(captureFrame, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetecting]);

  /** PERMISSIONS **/
  if (!permission) return <Text>Requesting camera permission...</Text>;
  if (!permission.granted)
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );

  if (photo) return <PhotoPreviewSection photo={photo} handleRetakePhoto={handleRetakePhoto} />;

  
  return (
    <ScrollView style={styles.container}>

      {/* <Button title="Get Location" onPress={getLocation} /> */}

      {/* Top buttons */}
      <View style={styles.topButtons}>
      <Button title="Upload from Gallery" onPress={() => pickVideo()} />

      
        <Button
          title={isDetecting ? 'Stop Live Detection' : 'Start Live Detection'}
          onPress={() => {
            if (isDetecting) stopDetectionAndGetReport();
            else startDetection();
          }}
        />
      </View>

      {/* Live Camera */}
      {isDetecting && (
        <View style={styles.cameraBox}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <AntDesign name="retweet" size={44} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleTakePhoto}>
                <AntDesign name="camera" size={44} color="white" />
              </TouchableOpacity>
            </View>
          </CameraView>
          <Text style={styles.detectionText}>Detections: {detections.length}</Text>
        </View>
      )}

      {/* Video display */}
      <View style={styles.videoBox}>
        <Text style={styles.boxTitle}>Uploaded Video</Text>
        {videoUri ? <Video source={{ uri: videoUri }} style={styles.video} useNativeControls /> : <Text>No video uploaded</Text>}
      </View>

      {/* <View style={styles.videoBox}>
        <Text style={styles.boxTitle}>Processed Video</Text>
        {processedVideoUri ? <Video source={{ uri: processedVideoUri }} style={styles.video} useNativeControls /> : <Text>Waiting for processing...</Text>}
      </View> */}
      <View>
 <View style={styles.reportBox}>
  <Text style={styles.boxTitle}>Report</Text>
  <Text>{place}</Text>

  {photoreportsUri && photoreportsUri.length > 0 ? (
    <View style={styles.reportCard}>
      {/* Single report text */}
      <Text style={styles.reportText}>{aireport}</Text>

      {/* Images grid */}{expandedImage && (
  <View style={styles.fullscreenOverlay}>
    <TouchableOpacity style={styles.closeButton} onPress={() => setExpandedImage(null)}>
      <Text style={styles.closeText}>✕</Text>
    </TouchableOpacity>
    <Image source={{ uri: expandedImage }} style={styles.fullscreenImage} resizeMode="contain" />
  </View>
)}

      <View style={styles.imagesGrid}>

        {photoreportsUri.map((x, index) => (
          
        // <TouchableOpacity key={index}onPress={() => setExpandedImage(`http://172.23.35.151:5000${x}`)}>
  <Image
    key={index}
    source={{ uri: `http://172.23.35.151:5000${x}` }}
    style={styles.reportImage}
  />
//  </TouchableOpacity>

        ))}
      </View>

      {/* Action buttons */}
      {/* <Pdfhandler/> */}
      <Button title='report' onPress={ReportHandler}></Button>
      <Button title='share report' onPress={sharepdf}></Button>
    </View>
  ) : (
    <Text style={{ textAlign: "center", marginTop: 20 }}>No report yet</Text>
  )}
</View>

       </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topButtons: {  justifyContent: 'space-around', marginBottom: 20 },
  cameraBox: { height: 350, marginBottom: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  camera: { flex: 1 },
  cameraControls: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginBottom: 20 },
  iconButton: { backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 10 },
  detectionText: { position: 'absolute', bottom: 10, left: 10, color: 'red', fontWeight: 'bold' },
  videoBox: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
 
  video: { width: '100%', height: 200, borderRadius: 8 },reportBox: {
    margin: 16,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  boxTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reportCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  reportText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  reportImage: {
    width: "48%", // two images per row
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#FF6347",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
fullscreenOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.9)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999, // stay above everything
},
fullscreenImage: {
  width: "100%",
  height: "100%",
},
closeButton: {
  position: "absolute",
  top: 40,
  right: 20,
  zIndex: 1000,
},
closeText: {
  fontSize: 30,
  color: "white",
},

});
 