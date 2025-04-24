
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Mail, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VerificationRequired = () => {
  const { user, refreshSession } = useAuth();
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin + '/auth/login',
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };
  
  const checkVerificationStatus = async () => {
    await refreshSession();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-md mx-auto p-6"
    >
      <div className="space-y-6">
        <Alert className="bg-primary-foreground border-primary/30">
          <Mail className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            We've sent a verification link to your email address. 
            Please check your inbox and click the link to verify your account.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <Button 
            onClick={checkVerificationStatus} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            I've verified my email
          </Button>
          
          <Button
            onClick={handleResendVerification}
            variant="secondary"
            disabled={resending}
            className="w-full"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
          
          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="text-sm text-primary hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerificationRequired;
