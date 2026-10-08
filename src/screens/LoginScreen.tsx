import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await login(email, password);
      navigation.navigate("Tabs");
    } catch (e) {
      Alert.alert("Couldn't sign in", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={loading ? "Signing in…" : "Sign in"} onPress={handleSubmit} loading={loading} />

      <Text style={styles.hint}>Demo accounts (after running the seed script on the backend):</Text>
      <Text style={styles.hintLine}>admin@example.com / AdminPass123</Text>
      <Text style={styles.hintLine}>seller@example.com / SellerPass123</Text>
      <Text style={styles.hintLine}>buyer@example.com / BuyerPass123</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: colors.canvas, flexGrow: 1 },
  hint: { marginTop: 16, fontSize: 12, color: colors.muted, fontWeight: "600" },
  hintLine: { fontSize: 12, color: colors.muted },
});
