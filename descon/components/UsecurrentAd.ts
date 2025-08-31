import * as Location from "expo-location";
import { useState, useEffect } from "react";

export default function useCurrentAddress() {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        // Ask for permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location denied");
          return;
        }

        // Get current location
        const lo = await Location.getCurrentPositionAsync({});
        console.log("Lat/Lng:", lo.coords.latitude, lo.coords.longitude);

        // Reverse geocode
        const result = await Location.reverseGeocodeAsync({
          latitude: lo.coords.latitude,
          longitude: lo.coords.longitude,
        });

        if (result.length > 0) {
          const place = result[0];
          const fullAddress = `${place.name ?? ""} ${place.street ?? ""}, ${place.city ?? ""}, ${place.region ?? ""}, ${place.country ?? ""}`;
          setAddress(fullAddress);
          console.log("Detected address:", fullAddress);
        }
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };

    fetchAddress();
  }, []);

  return address;
}
