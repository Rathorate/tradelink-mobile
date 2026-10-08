import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Point this at your machine's LAN IP when testing on a physical device
// or the Android emulator's host alias — see MOBILE_SETUP.md.
// 10.0.2.2 is the Android emulator's alias for the host machine's localhost.
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:3000`;

const TOKEN_KEY = "gcp_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  return AsyncStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: unknown) =>
    request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: (path: string, body?: unknown) =>
    request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
};
