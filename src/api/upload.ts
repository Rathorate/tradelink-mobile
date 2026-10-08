import * as ImagePicker from "expo-image-picker";
import { API_URL, getToken } from "./client";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const token = await getToken();
  const filename = asset.uri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const extMime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const mime = asset.mimeType && ALLOWED.includes(asset.mimeType) ? asset.mimeType : extMime;

  // Force the known-correct MIME type: React Native's Blob type detection
  // for local file:// URIs is unreliable (see NewListingScreen).
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
