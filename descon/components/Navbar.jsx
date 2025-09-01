import { View, Text, StyleSheet } from "react-native";


export default function Navbar() {
  return (
    <View edges={["top"]} style={styles.safeArea}>
      <View style={styles.navbar}>
        <Text style={styles.title}>StreetScan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  navbar: {
    height: 56,
    justifyContent: "center",
    alignItems: "left",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 3,
    // elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginLeft:9,
  },
});
