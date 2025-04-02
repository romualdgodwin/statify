import { Stack, Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, firestore } from "../../utils/firebase";
import { useEffect, useState } from "react";
import { collection, doc, getDoc } from "firebase/firestore";

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  
  const [role, setRole] = useState<string>();

  useEffect(() => {
    const userRef = doc(collection(firestore, "users"), auth.currentUser?.uid);
    getDoc(userRef).then((doc) => {
      setRole((doc.data() as any)?.role);
    }).catch(console.error)
  }, [])

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
      <Text>Role: {role}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
