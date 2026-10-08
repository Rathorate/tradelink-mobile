import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

const ROLES = ["BUYER", "SELLER", "BUSINESS"] as const;

export default function SignupScreen() {
  const { signup } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("NG");
  const [role, setRole] = useState<(typeof ROLES)[number]>("BUYER");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await signup({ name, email, password, role, country });
      navigation.navigate("Tabs");
    } catch (e) {
      Alert.alert("Couldn't create account", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Field label="Full name" value={name} onChangeText={setName} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Field label="Country" value={country} onChangeText={setCountry} autoCapitalize="characters" />

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.ink }}>Account type</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {ROLES.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleChip, role === r && styles.roleChipActive]}
            >
              <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button title={loading ? "Creating account…" : "Create account"} onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, backgroundColor: colors.canvas, flexGrow: 1 },
  roleChip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  roleChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleText: { fontSize: 12, color: colors.ink },
  roleTextActive: { color: "#fff" },
});
