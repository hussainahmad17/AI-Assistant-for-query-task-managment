
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
    console.log("Refreshing session");
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      const { session: refreshedSession } = data;
      if (refreshedSession) {
        setSession(refreshedSession);
        setUser(refreshedSession.user);
        // Check email verification status
        setEmailVerified(refreshedSession.user?.email_confirmed_at != null);
        console.log("Session refreshed, email verified:", refreshedSession.user?.email_confirmed_at != null);
      } else {
        console.log("No session found during refresh");
        setSession(null);
        setUser(null);
        setEmailVerified(false);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  };

  useEffect(() => {
    console.log("Auth context initializing");
    
    // First set up the auth state change listener
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log("Auth state changed, event:", _event);
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check email verification status when session changes
      const isVerified = newSession?.user?.email_confirmed_at != null;
      setEmailVerified(isVerified);
      console.log("Email verified:", isVerified);
      
      setLoading(false);
    });

    // Then check for existing session
    const checkExistingSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (existingSession) {
          console.log("Existing session found");
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Check email verification status on initial load
          const isVerified = existingSession.user?.email_confirmed_at != null;
          setEmailVerified(isVerified);
          console.log("Email verified:", isVerified);
        } else {
          console.log("No existing session found");
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkExistingSession();

    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Signing in user:", email);
    setLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error };
      }
      
      // Check if email is verified
      const isVerified = data.user?.email_confirmed_at != null;
      setEmailVerified(isVerified);
      console.log("Sign in successful, email verified:", isVerified);
      
      if (isVerified) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Force refresh the session
        await refreshSession();
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
        setEmailVerified(false);
      }
      
      return { error: isVerified ? null : new Error("Email verification required") };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("Signing up user:", email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth/login',
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        return { error };
      }
      
      console.log("Sign up successful, verification email sent");
      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account before signing in.",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log("Signing out user");
    setLoading(true);
    
    try {
      // First clear local storage to prevent potential data leaks
      localStorage.removeItem('assistant_history');
      
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
