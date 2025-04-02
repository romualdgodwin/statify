import { Stack, Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top}
    ]}>
      <Tabs.Screen
        options={{
          title: "Home",
          headerShown: false,
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
  },
});
