import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged, signOut } from "firebase/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  grantProForEmail: (email: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [proEmails, setProEmails] = useState<string[]>([]);

  useEffect(() => {
    // Ensure default PRO allowlist contains owner's email
    try {
      const stored = JSON.parse(localStorage.getItem("proUsers") || "[]");
      const base = Array.isArray(stored) ? stored : [];
      const owner = "aleksander.olek.tomczak@gmail.com";
      const ensured = base.includes(owner) ? base : [...base, owner];
      localStorage.setItem("proUsers", JSON.stringify(ensured));
      setProEmails(ensured);
    } catch {
      const ensured = ["aleksander.olek.tomczak@gmail.com"];
      localStorage.setItem("proUsers", JSON.stringify(ensured));
      setProEmails(ensured);
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const grantProForEmail = (email: string) => {
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) return;
    setProEmails((prev) => {
      const next = prev.includes(normalized) ? prev : [...prev, normalized];
      localStorage.setItem("proUsers", JSON.stringify(next));
      return next;
    });
  };

  const isPro = useMemo(() => {
    const email = user?.email?.toLowerCase();
    return !!(email && proEmails.includes(email));
  }, [user, proEmails]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isPro,
    grantProForEmail,
    logout: () => signOut(auth),
  }), [user, loading, isPro]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


