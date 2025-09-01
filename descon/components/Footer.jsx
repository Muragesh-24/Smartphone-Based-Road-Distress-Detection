

import { useRouter,usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
export default function FloatingFooter() {
  const router = useRouter();
  const pathname = usePathname();


  return (

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text
            style={[
              styles.footerLink,
              pathname === "/" && styles.activeLink,
            ]}
          >
            🏠 Home
          </Text>
        </TouchableOpacity>

  <TouchableOpacity onPress={() => router.push("/reports")}>
    <Text
      style={[
        styles.footerLink,
        pathname === "/reports" && styles.activeLink,
      ]}
    >
      📑 Reports
    </Text>
  </TouchableOpacity>



        <TouchableOpacity onPress={() => router.push("/auth")}>
          <Text
            style={[
              styles.footerLink,
              pathname === "/auth" && styles.activeLink,
            ]}
          >
            👤 Auth
          </Text>
        </TouchableOpacity>
      </View>

  );
}

const styles = StyleSheet.create({
footer: {
  height: 60,
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: "#fff",
  borderTopWidth: 1,
  borderTopColor: "#ddd",
//   elevation: 8,
//   shadowColor: "#000",
//   shadowOpacity: 0.08,
//   shadowOffset: { width: 0, height: -2 },
},



  footerLink: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  activeLink: {
    color: "#222",
    fontWeight: "bold",

  },
})