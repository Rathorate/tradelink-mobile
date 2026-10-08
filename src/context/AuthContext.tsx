import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "../api/client";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "SELLER" | "BUSINESS" | "ADMIN";
  verification: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
} | null;

type AuthContextType = {
  user: CurrentUser;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    role: "BUYER" | "SELLER" | "BUSINESS";
    country: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get("/api/auth/me");
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post("/api/auth/login", { email, password });
    await setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      role: "BUYER" | "SELLER" | "BUSINESS";
      country: string;
    }) => {
      const data = await api.post("/api/auth/signup", input);
      await setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
