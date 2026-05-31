"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, User } from "@/lib/api";
import { LoginInput, RegisterInput } from "@/lib/schemas";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem("todo_auth_token");
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem("todo_auth_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("todo_auth_token");
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await authService.login(data);
      if (res.data && res.data.access_token) {
        localStorage.setItem("todo_auth_token", res.data.access_token);
        setUser(res.data.user);
        setIsLoading(false);
        router.push("/dashboard");
      } else {
        throw new Error(res.message || "Failed to login");
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || error.message || "Login failed";
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await authService.register(data);
      if (res.data && res.data.access_token) {
        localStorage.setItem("todo_auth_token", res.data.access_token);
        setUser(res.data.user);
        setIsLoading(false);
        router.push("/dashboard");
      } else {
        throw new Error(res.message || "Failed to register");
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || error.message || "Registration failed";
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("todo_auth_token");
      setUser(null);
      router.push("/");
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getProfile();
      if (res.data && res.data.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
