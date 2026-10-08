import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, View, Image, Pressable, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, API_URL } from "../api/client";
import { uploadImage } from "../api/upload";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { colors, resolveImageUrl } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function EditListingScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "EditListing">>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/api/listings/${route.params.id}`)
      .then((d) => {
        const l = d.listing;
        setTitle(l.title);
        setDescription(l.description);
        setPrice((l.priceCents / 100).toString());
        setCurrency(l.currency);
        setCountry(l.country);
        setCity(l.city ?? "");
        setExistingImageUrl(l.imageUrl || null);
        setLoaded(true);
      })
      .catch((e) => Alert.alert("Couldn't load listing", (e as Error).message));
  }, [route.params.id]);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to change the listing photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setNewImage(result.assets[0]);
      setRemoveImage(false);
    }
  }

  async function handleSave() {
    const priceNum = parseFloat(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      Alert.alert("Check the price", "Enter a price greater than zero.");
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title,
        description,
        priceCents: Math.round(priceNum * 100),
        country,
        city: city || "",
      };
      if (newImage) {
        body.imageUrl = await uploadImage(newImage);
      } else if (removeImage) {
        body.imageUrl = "";
      }
      await api.patch(`/api/listings/${route.params.id}`, body);
      Alert.alert("Saved", "Your changes are live.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Couldn't save changes", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>Loading…</Text>
      </View>
    );
  }

  const displayUri =
    newImage?.uri ??
    (!removeImage && existingImageUrl ? resolveImageUrl(existingImageUrl, API_URL) : null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 8 }}>
        <Text style={styles.label}>Photo</Text>
        {displayUri ? (
          <Image source={{ uri: displayUri }} style={styles.preview} />
        ) : (
          <View style={styles.picker}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>No photo</Text>
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 18 }}>
          <Pressable onPress={pickImage}>
            <Text style={styles.link}>{displayUri ? "Change photo" : "Add photo"}</Text>
          </Pressable>
          {displayUri && (
            <Pressable
              onPress={() => {
                setNewImage(null);
                setRemoveImage(true);
              }}
            >
              <Text style={[styles.link, { color: colors.alert }]}>Remove photo</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      <Field label={`Price (${currency})`} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Field label="Country" value={country} onChangeText={setCountry} autoCapitalize="characters" />
      <Field label="City (optional)" value={city} onChangeText={setCity} />
      <Button title={saving ? "Saving…" : "Save changes"} onPress={handleSave} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { padding: 20, gap: 16, backgroundColor: colors.canvas, flexGrow: 1 },
  label: { fontSize: 14, fontWeight: "600", color: colors.ink },
  preview: { width: 120, height: 120, borderRadius: 10 },
  picker: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  link: { fontSize: 13, fontWeight: "600", color: colors.ink, textDecorationLine: "underline" },
});
