import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

export function VerifiedBadge({ status }: { status: string }) {
  if (status === "VERIFIED") {
    return (
      <View style={[styles.badge, { backgroundColor: colors.verifiedTint }]}>
        <Text style={[styles.text, { color: colors.verified }]}>✓ Verified</Text>
      </View>
    );
  }
  if (status === "PENDING") {
    return (
      <View style={[styles.badge, { backgroundColor: colors.brassTint }]}>
        <Text style={[styles.text, { color: colors.brassDark }]}>Pending</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: "#F1F2F4" }]}>
      <Text style={[styles.text, { color: colors.muted }]}>Unverified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  text: { fontSize: 12, fontWeight: "500" },
});
