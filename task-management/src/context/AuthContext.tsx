import React, { createContext, useState, useEffect } from "react";
import type { IUser } from "../types/users/user.types";
import api from "../api/axios.interceptor";

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchMe = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.get("/auth/me");

      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchMe();
    } else {
      setIsLoading(false);
    }

    const onForcedLogout = () => logout();
    window.addEventListener("auth-logout", onForcedLogout);
    return () => window.removeEventListener("auth-logout", onForcedLogout);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    if (res?.data?.refresh_token) {
      localStorage.setItem("refresh_token", res.data.refresh_token);
    }
    await fetchMe();
  };

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<void> => {
    const res = await api.post("/auth/register", { email, password, name });
    const token = res?.data?.access_token;
    if (token) {
      localStorage.setItem("token", token);
      if (res?.data?.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
      }
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        await fetchMe();
      }
    } else {
      await login(email, password);
    }
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
