
import { createContext, useContext, useEffect, useState } from "react";
import { loginApi } from "../services/api.js";

const AuthContext = createContext(null);

const USER_KEY = "bookleaf_user";
const TOKEN_KEY = "bookleaf_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      return storedUser && token ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      if (storedUser && token) {
        setUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await loginApi(credentials);

    // Expected API response: { user, token }
    const { user: loggedInUser, token } = response;

    if (!loggedInUser || !token) {
      throw new Error("Invalid login response from server");
    }

    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(TOKEN_KEY, token);

    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
