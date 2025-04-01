import { Stack, Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export const ProfileScreen = () => {
    return (
        <View style={styles.container}>
        <Tabs.Screen
            options={{
            title: "Profile",
            }}
        />
        <Text>Profile Screen</Text>
        </View>
    );
    }
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});