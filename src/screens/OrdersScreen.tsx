import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { api } from "../api/client";
import { colors, formatMoney, ORDER_STATUS_LABEL } from "../theme";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

type Order = {
  id: string;
  status: string;
  quantity: number;
  totalCents: number;
  currency: string;
  listingId: string;
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  PAID: "Mark as shipped",
  SHIPPED: "Confirm delivered",
  DELIVERED: "Release funds",
};

export default function OrdersScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"buyer" | "seller">("buyer");
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (as: "buyer" | "seller") => {
    try {
      const data = await api.get(`/api/orders?as=${as}`);
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    if (user) load(tab);
  }, [user, tab, load]);

  async function act(orderId: string, action: "advance" | "dispute") {
    setBusyId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}`, { action });
      await load(tab);
    } finally {
      setBusyId(null);
    }
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Sign in to see your orders.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={styles.tabs}>
        {(["buyer", "seller"] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={styles.tabBtn}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "buyer" ? "As buyer" : "As seller"}
            </Text>
            {tab === t && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
        renderItem={({ item }) => {
          const nextAction =
            (tab === "seller" && item.status === "PAID") ||
            (tab === "buyer" && (item.status === "SHIPPED" || item.status === "DELIVERED"));
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{formatMoney(item.totalCents, item.currency)}</Text>
              <Text style={styles.cardStatus}>{ORDER_STATUS_LABEL[item.status] ?? item.status}</Text>
              {nextAction && (
                <Button
                  title={NEXT_ACTION_LABEL[item.status]}
                  variant="secondary"
                  loading={busyId === item.id}
                  onPress={() => act(item.id, "advance")}
                />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 60, gap: 20, borderBottomWidth: 1, borderColor: colors.border },
  tabBtn: { paddingBottom: 10 },
  tabText: { fontSize: 14, color: colors.muted, fontWeight: "600" },
  tabTextActive: { color: colors.ink },
  tabIndicator: { height: 2, backgroundColor: colors.ink, marginTop: 8, borderRadius: 1 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  cardStatus: { fontSize: 13, color: colors.muted },
});
