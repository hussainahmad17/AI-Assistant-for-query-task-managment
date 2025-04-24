
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setErrorMsg("");

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setErrorMsg("");
    const { error } = await signIn(email, password);

    if (error) {
      const errorMessage = error?.message || "Login failed.";
      setErrorMsg(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate("/chat");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-muted-foreground">Sign in to continue to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            className={`focus-visible:ring-primary/50 ${emailError ? "border-destructive" : ""}`}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {emailError}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <Label htmlFor="password">Password</Label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              className={`focus-visible:ring-primary/50 ${passwordError ? "border-destructive" : ""}`}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent focus:ring-0"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {passwordError}
            </p>
          )}
        </div>
        
        {errorMsg && (
          <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-sm">{errorMsg}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          aria-label="Sign in to your account"
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
