import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, API_URL } from "../api/client";
import { colors, formatMoney, resolveImageUrl } from "../theme";
import { Button } from "../components/Button";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/AppNavigator";

type Listing = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  country: string;
  city?: string | null;
  sellerId: string;
  imageUrl?: string | null;
};
type Seller = { id: string; name: string; verification: string };

export default function ListingDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ListingDetail">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api.get(`/api/listings/${route.params.id}`).then((d) => setListing(d.listing));
  }, [route.params.id]);

  async function handleBuy() {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    if (!listing) return;
    setBuying(true);
    try {
      await api.post("/api/orders", { listingId: listing.id, quantity: 1 });
      Alert.alert("Order placed", "Find it under Orders (test-mode payment — no real funds moved).");
    } catch (e) {
      Alert.alert("Couldn't place order", (e as Error).message);
    } finally {
      setBuying(false);
    }
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Loading…</Text>
      </View>
    );
  }

  const isOwnListing = user?.id === listing.sellerId;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.thumb}>
        {listing.imageUrl ? (
          <Image source={{ uri: resolveImageUrl(listing.imageUrl, API_URL) }} style={styles.thumbImage} />
        ) : (
          <Text style={styles.thumbLetter}>{listing.title.charAt(0)}</Text>
        )}
      </View>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.price}>{formatMoney(listing.priceCents, listing.currency)}</Text>
      <Text style={styles.location}>
        {listing.city ? `${listing.city}, ` : ""}
        {listing.country}
      </Text>
      <Text style={styles.description}>{listing.description}</Text>

      {!isOwnListing && (
        <Button title={buying ? "Placing order…" : "Buy now (test mode)"} onPress={handleBuy} loading={buying} />
      )}
      {isOwnListing && <Text style={{ color: colors.muted, marginTop: 12 }}>This is your own listing.</Text>}

      <Text style={styles.disclaimer}>
        Buyer protection: funds are held until you confirm delivery, then released to the seller.
        This build runs payments in test mode — no real money moves.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  thumb: {
    height: 220,
    borderRadius: 12,
    backgroundColor: "#F3F2EE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbLetter: { fontSize: 64, color: colors.borderStrong, fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  price: { fontSize: 20, fontWeight: "700", color: colors.ink, marginTop: 6 },
  location: { fontSize: 13, color: colors.muted, marginTop: 2 },
  description: { fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginTop: 16, marginBottom: 20 },
  disclaimer: { fontSize: 11, color: colors.muted, marginTop: 16 },
});
