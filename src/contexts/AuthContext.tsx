import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { AdminUser } from "@/types/content";

export const dashboardRoles = ["admin", "editor", "admissions_manager", "enquiries_manager"] as const;

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api
      .getSession()
      .then((response) => {
        if (mounted) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    const response = await api.login(username, password);
    setUser(response.user);
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin: Boolean(user && dashboardRoles.includes(user.role as (typeof dashboardRoles)[number])), loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
