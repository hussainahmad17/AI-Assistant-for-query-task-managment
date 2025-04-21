
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileForm, ProfileFormData } from "@/components/auth/ProfileForm";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (data: ProfileFormData) => {
    setLoading(true);
    
    try {
      const { error } = await signUp(data.email, data.password);

      if (error) {
        console.error("Registration error:", error);
        toast({
          title: "Registration failed",
          description: error?.message || "Error creating your account. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created",
          description: "Welcome to Personal Assistant!",
        });
        navigate("/chat");
      }
    } catch (err) {
      console.error("Unexpected registration error:", err);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ProfileForm onSubmit={handleRegister} isLoading={loading} />
      
      <div className="mt-4 text-center text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
