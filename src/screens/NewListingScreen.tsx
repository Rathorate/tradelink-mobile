import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert, View, Image, Pressable, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api, API_URL, getToken } from "../api/client";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { colors } from "../theme";
import type { RootStackParamList } from "../navigation/AppNavigator";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function NewListingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [country, setCountry] = useState("NG");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to add an image to your listing.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  }

  async function uploadImage(asset: ImagePicker.ImagePickerAsset): Promise<string> {
    const token = await getToken();
    const filename = asset.uri.split("/").pop() ?? "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const extMime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    // Prefer the asset's own reported MIME type (expo-image-picker usually
    // provides this accurately); fall back to guessing from the filename.
    const mime =
      asset.mimeType && ALLOWED.includes(asset.mimeType) ? asset.mimeType : extMime;

    // React Native's fetch/Blob implementation doesn't reliably detect the
    // correct type for a local file:// URI — it can come back empty or
    // wrong, which made the server's JPEG/PNG/WebP whitelist reject valid
    // photos. Fetching the file still works fine for getting the actual
    // bytes; we just override the resulting Blob's type with the known-
    // correct one instead of trusting what was auto-detected.
    const fileResponse = await fetch(asset.uri);
    const rawBlob = await fileResponse.blob();
    const blob = new Blob([rawBlob], { type: mime });

    const formData = new FormData();
    formData.append("file", blob, filename);

    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Couldn't upload image");
    return data.url as string;
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      const data = await api.post("/api/listings", {
        title,
        description,
        priceCents: Math.round(parseFloat(price) * 100),
        currency: "USD",
        country,
        city: city || undefined,
        imageUrl,
      });
      if (data.flagged) {
        Alert.alert("Published", "Listing published, but flagged for trust & safety review.");
      }
      navigation.navigate("ListingDetail", { id: data.listing.id });
    } catch (e) {
      Alert.alert("Couldn't publish listing", (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ gap: 6 }}>
        <Text style={styles.label}>Photo (optional)</Text>
        {image ? (
          <Pressable onPress={pickImage}>
            <Image source={{ uri: image.uri }} style={styles.preview} />
          </Pressable>
        ) : (
          <Pressable onPress={pickImage} style={styles.picker}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Tap to choose a photo</Text>
          </Pressable>
        )}
      </View>

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} />
      <Field label="Price (USD)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Field label="Country" value={country} onChangeText={setCountry} autoCapitalize="characters" />
      <Field label="City (optional)" value={city} onChangeText={setCity} />
      <Button title={loading ? "Publishing…" : "Publish listing"} onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    padding: 8,
  },
});
