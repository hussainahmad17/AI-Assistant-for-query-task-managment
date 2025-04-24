
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordStrengthHint } from "@/components/auth/PasswordStrengthHint";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);

    if (password.length < 8) {
      setLoading(false);
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    
    try {
      const { error } = await signUp(email, password);

      if (error) {
        setErrorMsg(error?.message || "Could not create account.");
        toast({
          title: "Registration failed",
          description: error?.message || "Error creating your account. Please try again.",
          variant: "destructive"
        });
      } else {
        setSuccess(true);
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account before signing in.",
        });
        // Don't navigate away - show success message on this page
      }
    } catch (err: any) {
      setErrorMsg("Unexpected error. Please try again.");
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
      {success ? (
        <div className="space-y-4">
          <Alert className="bg-primary-foreground border-primary/30">
            <Mail className="h-4 w-4" />
            <AlertTitle>Verification email sent</AlertTitle>
            <AlertDescription>
              We've sent an email to <span className="font-medium">{email}</span>. 
              Please check your inbox and click the verification link to complete your registration.
            </AlertDescription>
          </Alert>
          <p className="text-center text-sm text-muted-foreground mt-4">
            After verification, you can{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
            <PasswordStrengthHint password={password} />
          </div>
          {errorMsg && <div className="text-sm text-destructive">{errorMsg}</div>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register"}
          </Button>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default Register;
