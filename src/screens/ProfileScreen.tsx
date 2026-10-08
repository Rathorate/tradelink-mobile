import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>You're not signed in</Text>
        <View style={{ height: 12 }} />
        <Button title="Sign in" onPress={() => navigation.navigate("Login")} />
        <View style={{ height: 8 }} />
        <Button title="Create account" variant="secondary" onPress={() => navigation.navigate("Signup")} />
      </View>
    );
  }

  const canSell = user.role === "SELLER" || user.role === "BUSINESS" || user.role === "ADMIN";

  return (
    <View style={[styles.center, { alignItems: "stretch", paddingHorizontal: 24 }]}>
      <View style={{ alignItems: "center", gap: 8, marginBottom: 24 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.title}>{user.name}</Text>
        <VerifiedBadge status={user.verification} />
        <Text style={{ color: colors.muted, fontSize: 13 }}>{user.email}</Text>
      </View>

      {canSell && (
        <>
          <Button title="List something new" onPress={() => navigation.navigate("NewListing")} />
          <View style={{ height: 12 }} />
          <Button title="My listings" variant="secondary" onPress={() => navigation.navigate("MyListings")} />
        </>
      )}
      <View style={{ height: 12 }} />
      <Button title="Sign out" variant="secondary" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.canvas },
  title: { fontSize: 18, fontWeight: "700", color: colors.ink },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 24, fontWeight: "700" },
});
