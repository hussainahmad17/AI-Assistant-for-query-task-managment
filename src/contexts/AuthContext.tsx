
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: any;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error?: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listen to auth changes and sync session/user
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password
    });
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  // Fixed OAuth sign in method with better browser compatibility
  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      // Get the current URL's origin for the redirect
      const origin = window.location.origin;
      const redirectUrl = `${origin}/chat`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: provider === 'google' ? {
            // Adding optional query parameters for Google OAuth
            access_type: 'offline',
            prompt: 'consent'
          } : undefined
        }
      });
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: `${provider} login failed: ${error.message}`,
          variant: "destructive"
        });
      }
      
      return { error };
    } catch (err: any) {
      toast({
        title: "Authentication Error",
        description: `${provider} login failed: ${err.message}`,
        variant: "destructive"
      });
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
