"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Role } from "@/lib/types";

type AuthUser = {
  username: string;
  role: Role;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AUTH_KEY = "fleetflow_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (username: string, password: string, role: Role) => {
        if (!username || !password) {
          throw new Error("Username and password are required.");
        }
        const token = btoa(`${username}:${role}:${Date.now()}`);
        const authUser = { username, role, token };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
        setUser(authUser);
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
