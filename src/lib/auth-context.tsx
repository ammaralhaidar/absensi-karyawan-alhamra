"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Role } from "@/types";

interface AuthSession {
  role: Role;
  userId: string;
  userName: string;
  departmentId?: string;
}

interface AuthContextType {
  session: AuthSession | null;
  login: (role: Role, userId?: string, userName?: string, deptId?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("alhamra_auth");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem("alhamra_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (role: Role, userId?: string, userName?: string, deptId?: string) => {
    const s: AuthSession = {
      role,
      userId: userId ?? "demo",
      userName: userName ?? "Demo User",
      departmentId: deptId,
    };
    setSession(s);
    localStorage.setItem("alhamra_auth", JSON.stringify(s));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("alhamra_auth");
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
