import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { firestore } from "../../utils/firebase";

const logo = require('../resources/ort-logo.png')

export const LoginScreen = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);

  const onSubmit = async () => {
    const usersRef = collection(firestore, 'users')
    const usersQuery = query(usersRef, where('login', '==', login), where('password', '==', password))
    const docs  = await getDocs(usersQuery)
    if(docs.empty) {
      Alert.alert("Login failed", "Invalid credentials");
      return;
    }
    router.push("/home");
  }

  return (
    <ScrollView ref={scrollViewRef} style={{flex: 1}} contentContainerStyle={{ paddingBottom: 300}}>
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Login",
          }}
        />
        <Image style={styles.image} source={logo} />
        <TextInput
         autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          style={styles.input}
          value={login}
          onChangeText={setLogin}
          placeholder="Login"
          onFocus={() => {
            console.log('scroll')
            scrollViewRef.current?.scrollToEnd()
          }}
          returnKeyType="next"
          onSubmitEditing={() => {
            passwordRef.current?.focus();
          }}
        />
        <TextInput
         ref={passwordRef}
         secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          returnKeyType="send"
        />
        <View style={styles.button}>
          <Button
            title="Submit"
            onPress={onSubmit}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  image: {
    alignSelf: "center",
  },
  button: {
    borderWidth: 1,
    borderRadius: 50,
    padding: 16,
  },
});
