import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "@monthly-budgeting-app/shared";
import { ApiService } from "../services/api.service";

interface AuthContextType {
  User: User | null;
  Token: string | null;
  IsLoading: boolean;
  Login: (email: string, password: string) => Promise<void>;
  Register: (name: string, email: string, password: string) => Promise<void>;
  UpdateProfile: (name: string) => Promise<void>;
  Logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await ApiService.GetMe();
          if (res.Success && res.Data) {
            setUser(res.Data);
            setToken(storedToken);
          } else {
            ApiService.SetToken(null);
            setUser(null);
            setToken(null);
          }
        } catch {
          ApiService.SetToken(null);
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.User);
    setToken(data.Token);
    ApiService.SetToken(data.Token);
  };

  const login = async (email: string, password: string) => {
    const res = await ApiService.Login({ Email: email, Password: password });
    if (res.Success && res.Data) {
      handleAuthSuccess(res.Data);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await ApiService.Register({ Name: name, Email: email, Password: password });
    if (res.Success && res.Data) {
      handleAuthSuccess(res.Data);
    }
  };

  const updateProfile = async (name: string) => {
    const res = await ApiService.UpdateProfile({ Name: name });
    if (res.Success && res.Data) {
      setUser(res.Data);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    ApiService.SetToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        User: user,
        Token: token,
        IsLoading: isLoading,
        Login: login,
        Register: register,
        UpdateProfile: updateProfile,
        Logout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
