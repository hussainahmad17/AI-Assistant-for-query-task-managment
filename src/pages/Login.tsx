
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { signIn, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error?.message || "Login failed.");
      toast({
        title: "Login failed",
        description: error?.message || "Please check your credentials and try again.",
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

  const handleSocial = async (provider: 'google' | 'facebook') => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg("Unable to continue with selected provider.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
              onChange={(e) => setPassword(e.target.value)}
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
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        {errorMsg && <div className="text-sm text-destructive">{errorMsg}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <div className="flex flex-col gap-2 mt-2">
          <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocial("google")} disabled={loading}>
            <span>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><g><path fill="#4285F4" d="M21.805 10.023h-9.438v3.92h5.432c-.236 1.19-1.325 3.494-5.432 3.494A6.001 6.001 0 0 1 5.979 12a6.001 6.001 0 0 1 6.386-6c1.465 0 2.773.512 3.802 1.52l2.8-2.8A10.032 10.032 0 0 0 12.365 2C6.736 2 2 6.714 2 12s4.736 10 10.365 10c5.763 0 9.635-4.187 9.635-10 0-.726-.08-1.434-.195-1.977z"></path></g></svg>
            </span>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={() => handleSocial("facebook")} disabled={loading}>
            <span>
              <svg className="h-4 w-4 text-[#1877f3]" viewBox="0 0 24 24"><g><path fill="#1877f3" d="M22.675 0H1.325A1.326 1.326 0 0 0 0 1.325v21.351A1.325 1.325 0 0 0 1.325 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.314h3.587l-.467 3.622h-3.12V24h6.116A1.326 1.326 0 0 0 24 22.675V1.325A1.325 1.325 0 0 0 22.675 0"></path></g></svg>
            </span>
            Continue with Facebook
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
};

export default Login;
