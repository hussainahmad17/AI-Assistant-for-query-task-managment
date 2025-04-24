
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

type AuthContextType = {
  user: any;
  session: any;
  loading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to refresh the session data
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      const { session: refreshedSession } = data;
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        // Check email verification status
        setEmailVerified(refreshedSession.user?.email_confirmed_at != null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  useEffect(() => {
    // First set up the auth state change listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Check email verification status when session changes
      setEmailVerified(session?.user?.email_confirmed_at != null);
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Check email verification status on initial load
      setEmailVerified(session?.user?.email_confirmed_at != null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (!error) {
        // Check if email is verified
        const isVerified = data.user?.email_confirmed_at != null;
        setEmailVerified(isVerified);
        
        if (isVerified) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } else {
          toast({
            title: "Email verification required",
            description: "Please verify your email before signing in.",
            variant: "destructive",
          });
          // Sign out if email is not verified
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        }
      }
      
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/login',
        }
      });
      
      if (!error) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account before signing in.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setEmailVerified(false);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      emailVerified, 
      signIn, 
      signUp, 
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

// Higher-order component to protect routes that require verification
export const RequireVerifiedEmail = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, emailVerified } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (!emailVerified) {
    return <Navigate to="/auth/verification-required" replace />;
  }
  
  return <>{children}</>;
};
