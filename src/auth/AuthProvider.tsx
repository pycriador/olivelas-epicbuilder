import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  changePassword as apiChangePassword,
  login as apiLogin,
  logout as apiLogout,
  me as apiMe,
  refresh as apiRefresh,
  type AuthUser,
} from "@/lib/auth-api";

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: {
    login: string;
    password: string;
    remember_me?: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  changePassword: (input: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
  hasPermission: (code: string) => boolean;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const profile = await apiMe();
      setUser(profile);
      void import("@/lib/content-store").then((m) => m.refreshContentFromApi().catch(() => {}));
    } catch {
      const token = await apiRefresh();
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const profile = await apiMe();
        setUser(profile);
        void import("@/lib/content-store").then((m) => m.refreshContentFromApi().catch(() => {}));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadSession();
      setLoading(false);
    })();
  }, [loadSession]);

  const login = useCallback(
    async (input: { login: string; password: string; remember_me?: boolean }) => {
      await apiLogin(input);
      const profile = await apiMe();
      setUser(profile);
      void import("@/lib/content-store").then((m) => m.refreshContentFromApi().catch(() => {}));
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const changePassword = useCallback(
    async (input: { current_password: string; new_password: string }) => {
      await apiChangePassword(input);
      await loadSession();
    },
    [loadSession],
  );

  const hasPermission = useCallback(
    (code: string) => {
      if (!user) return false;
      if (user.is_admin) return true;
      return user.permissions.includes(code) || user.permissions.includes("iam.admin");
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
      changePassword,
      hasPermission,
      isAdmin: Boolean(user?.is_admin),
    }),
    [user, loading, login, logout, refresh, changePassword, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
