import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  onIdTokenChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../api/axios";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Keep token fresh whenever Firebase refreshes it
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const token = await fbUser.getIdToken();
          localStorage.setItem("admin_token", token);
        } else {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
          setUser(null);
        }
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    // 1. Firebase sign-in
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // 2. Get Firebase ID token
    const token = await credential.user.getIdToken();
    localStorage.setItem("admin_token", token);

    // 3. Verify with backend — creates/updates user record and returns profile
    const res = await api.post(
      "/api/auth/session",
      {
        idToken: token,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const profile: User = res.data?.user ?? res.data?.data ?? res.data;
    console.log("Logged in user profile:", profile);

    // 4. Ensure admin role
    if (!profile || (profile.role !== "admin" && !profile.is_admin)) {
      await signOut(auth);
      localStorage.removeItem("admin_token");
      throw new Error("Access denied. Admin account required.");
    }

    localStorage.setItem("admin_user", JSON.stringify(profile));
    setUser(profile);
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
