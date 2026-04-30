import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
 type ReactNode,
} from "react";
import axiosInstance from "../api/axiosInstance";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export type UserRole = "admin" | "analyst";

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<User>("/api/v1/auth/me");
      setUser(data);
    } catch {
      // 401 interceptor will attempt a token refresh automatically.
      // If that also fails, the interceptor rejects and we land here.
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchSession();
    };
    initializeAuth();
  }, [fetchSession]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/api/v1/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchSession();
  }, [fetchSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}