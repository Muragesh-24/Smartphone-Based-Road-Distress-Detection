import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";

import { Asset } from "expo-asset";
// const NotFound = require("@/assets/images/NotFound.svg");

export default function NotFoundScreen() {
  return (
    <>

    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  meal: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  row: {
    fontSize: 16,
    marginTop: 10,
    color: "#666",
  },
});
