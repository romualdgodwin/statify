import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Home",
        }}
      />
      <Text>Home Screen</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
