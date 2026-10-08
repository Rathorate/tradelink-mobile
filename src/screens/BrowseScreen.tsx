import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, Pressable, RefreshControl, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, API_URL } from "../api/client";
import { colors, formatMoney, resolveImageUrl } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Listing = {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  country: string;
  city?: string | null;
  imageUrl?: string | null;
};
export default function BrowseScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    try {
      const data = await api.get(`/api/listings${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setListings(data.listings ?? []);
    } catch {
      // Keep last known listings on network error rather than clearing them.
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load(query);
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TradeLink</Text>
        <Text style={styles.subtitle}>Trade with confidence. Across borders.</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => load(query)}
          placeholder="Search verified products, services…"
          placeholderTextColor={colors.muted}
          style={styles.search}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No listings match yet.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("ListingDetail", { id: item.id })}
          >
            <View style={styles.thumb}>
              {item.imageUrl ? (
                <Image source={{ uri: resolveImageUrl(item.imageUrl, API_URL) }} style={styles.thumbImage} />
              ) : (
                <Text style={styles.thumbLetter}>{item.title.charAt(0)}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>{formatMoney(item.priceCents, item.currency)}</Text>
              <Text style={styles.cardLocation}>
                {item.city ? `${item.city}, ` : ""}
                {item.country}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: { backgroundColor: colors.ink, padding: 20, paddingTop: 60, gap: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 12 },
  search: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: "#F3F2EE",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },  thumbLetter: { fontSize: 24, color: colors.borderStrong, fontWeight: "600" },
  cardTitle: { fontSize: 14, fontWeight: "600", color: colors.ink },
  cardPrice: { fontSize: 15, fontWeight: "700", color: colors.ink, marginTop: 4 },
  cardLocation: { fontSize: 12, color: colors.muted, marginTop: 2 },
});
