import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // 🔹 Get current session on load
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Session load error:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 🔹 Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🔐 SIGNUP
  const signup = async (email, password) => {
    if (authLoading) return;

    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (err) {
      console.error("Signup error:", err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔐 LOGIN
  const login = async (email, password) => {
    if (authLoading) return;

    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user || null);

      return data;
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔐 LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // 🔑 GET TOKEN
  const getToken = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    return data.session?.access_token || null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        getToken,
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
};