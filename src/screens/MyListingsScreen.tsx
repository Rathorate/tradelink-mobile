import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, Image, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, API_URL, getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, formatMoney, resolveImageUrl } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Listing = {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  status: string;
  imageUrl?: string | null;
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  ACTIVE: { bg: colors.verifiedTint, fg: colors.verified },
  PAUSED: { bg: colors.brassTint, fg: colors.brassDark },
  DRAFT: { bg: "#F1F2F4", fg: colors.muted },
};

export default function MyListingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.get(`/api/listings?sellerId=${user.id}`);
      setListings((data.listings ?? []).filter((l: Listing) => l.status !== "REMOVED"));
    } catch (e) {
      Alert.alert("Couldn't load your listings", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reload every time this screen regains focus, so edits made on the
  // Edit screen show up immediately when you come back.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleStatus(l: Listing) {
    setBusyId(l.id);
    try {
      await api.patch(`/api/listings/${l.id}`, {
        status: l.status === "PAUSED" ? "ACTIVE" : "PAUSED",
      });
      await load();
    } catch (e) {
      Alert.alert("Couldn't update listing", (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function doDelete(l: Listing) {
    setBusyId(l.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/listings/${l.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      await load();
    } catch (e) {
      Alert.alert("Couldn't remove listing", (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function confirmDelete(l: Listing) {
    Alert.alert("Remove listing?", `"${l.title}" will disappear from the marketplace immediately.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => doDelete(l) },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={listings}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : (
            <View style={{ alignItems: "center", marginTop: 40, gap: 12 }}>
              <Text style={styles.empty}>You haven't listed anything yet.</Text>
              <Pressable onPress={() => navigation.navigate("NewListing")}>
                <Text style={styles.linkStrong}>List something new</Text>
              </Pressable>
            </View>
          )
        }
        renderItem={({ item }) => {
          const badge = STATUS_STYLE[item.status] ?? STATUS_STYLE.DRAFT;
          const busy = busyId === item.id;
          return (
            <View style={styles.card}>
              <Pressable
                style={styles.row}
                onPress={() => navigation.navigate("ListingDetail", { id: item.id })}
              >
                <View style={styles.thumb}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: resolveImageUrl(item.imageUrl, API_URL) }}
                      style={styles.thumbImage}
                    />
                  ) : (
                    <Text style={styles.thumbLetter}>{item.title.charAt(0)}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.price}>{formatMoney(item.priceCents, item.currency)}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.fg }]}>{item.status}</Text>
                </View>
              </Pressable>

              <View style={styles.actions}>
                <Pressable disabled={busy} onPress={() => navigation.navigate("EditListing", { id: item.id })}>
                  <Text style={styles.link}>Edit</Text>
                </Pressable>
                <Pressable disabled={busy} onPress={() => toggleStatus(item)}>
                  <Text style={[styles.link, busy && { opacity: 0.4 }]}>
                    {item.status === "PAUSED" ? "Reactivate" : "Mark out of stock"}
                  </Text>
                </Pressable>
                <Pressable disabled={busy} onPress={() => confirmDelete(item)}>
                  <Text style={[styles.link, { color: colors.alert }, busy && { opacity: 0.4 }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  empty: { textAlign: "center", color: colors.muted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#F3F2EE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbLetter: { fontSize: 22, color: colors.borderStrong, fontWeight: "600" },
  title: { fontSize: 14, fontWeight: "600", color: colors.ink },
  price: { fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  link: { fontSize: 13, fontWeight: "600", color: colors.ink, textDecorationLine: "underline" },
  linkStrong: { fontSize: 14, fontWeight: "700", color: colors.ink, textDecorationLine: "underline" },
});
