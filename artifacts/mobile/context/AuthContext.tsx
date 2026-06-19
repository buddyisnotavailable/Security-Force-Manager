import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const PIN_KEY = "@sec_manager_pin";

interface AuthContextType {
  isAuthenticated: boolean;
  hasPin: boolean;
  loading: boolean;
  setupPin: (pin: string) => Promise<void>;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PIN_KEY);
        setHasPin(!!stored);
      } catch {
        setHasPin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    await AsyncStorage.setItem(PIN_KEY, pin);
    setHasPin(true);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(PIN_KEY);
      if (stored === pin) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(PIN_KEY);
      if (stored !== oldPin) return false;
      await AsyncStorage.setItem(PIN_KEY, newPin);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, hasPin, loading, setupPin, login, logout, changePin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
