import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from "react-native";
import { api } from "../api/client";
import { colors } from "../theme";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

type Partner = { id: string; name: string; verification: string };
type Msg = { id: string; body: string; senderId: string };

export default function MessagesScreen() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");

  const loadPartners = useCallback(async () => {
    try {
      const data = await api.get("/api/messages");
      setPartners(data.partners ?? []);
    } catch {
      setPartners([]);
    }
  }, []);

  useEffect(() => {
    if (user) loadPartners();
  }, [user, loadPartners]);

  async function openThread(id: string) {
    setActiveId(id);
    const data = await api.get(`/api/messages?with=${id}`);
    setThread(data.thread ?? []);
  }

  async function send() {
    if (!draft.trim() || !activeId) return;
    await api.post("/api/messages", { recipientId: activeId, body: draft });
    setDraft("");
    const data = await api.get(`/api/messages?with=${activeId}`);
    setThread(data.thread ?? []);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Sign in to see your messages.</Text>
      </View>
    );
  }

  if (activeId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: 60 }}>
        <Pressable onPress={() => setActiveId(null)} style={{ padding: 16 }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>← Conversations</Text>
        </Pressable>
        <FlatList
          data={thread}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.senderId === user.id ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text style={{ color: item.senderId === user.id ? "#fff" : colors.ink }}>{item.body}</Text>
            </View>
          )}
        />
        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            style={styles.input}
          />
          <Button title="Send" onPress={send} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: 60 }}>
      <Text style={styles.header}>Messages</Text>
      <FlatList
        data={partners}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet — message a seller from a listing.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.partnerRow} onPress={() => openThread(item.id)}>
            <Text style={{ color: colors.ink, fontWeight: "600" }}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { fontSize: 20, fontWeight: "700", color: colors.ink, paddingHorizontal: 16 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  partnerRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubble: { maxWidth: "75%", borderRadius: 10, padding: 10 },
  bubbleMine: { backgroundColor: colors.ink, alignSelf: "flex-end" },
  bubbleTheirs: { backgroundColor: "#F1F0EC", alignSelf: "flex-start" },
  composer: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderColor: colors.border },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
