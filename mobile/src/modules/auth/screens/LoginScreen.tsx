import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export const LoginScreen = () => {
  const [value, setValue] = useState("");
  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: "Login"
      }} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
      />
      <View style={styles.button}>
        <Button title="Go" onPress={() => {
          router.push("/home");
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    flex: 1,
    padding: 16,
  },
  button: {
    borderWidth: 1,
    borderRadius: "100%",
    padding: 16,
  },
});
