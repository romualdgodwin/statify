import { Stack, Tabs } from "expo-router";

export default function Layout() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Tabs />
    </>
  );
}
