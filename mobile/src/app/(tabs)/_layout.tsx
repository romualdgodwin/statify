import { Stack, Tabs } from "expo-router";

export default function Layout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  );
}
