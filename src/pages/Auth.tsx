import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Access granted.");
        navigate("/onboarding");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Sign in instead.");
          } else {
            throw error;
          }
        } else {
          try {
            await supabase.functions.invoke("send-email", {
              body: { type: "welcome", to: email },
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
          }
          
          toast.success("Account created. Welcome to DOMINION.");
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      {/* Power Background Effects - ensure they don't block interaction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/6 rounded-full blur-[120px]" />
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-50"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-card border border-border/50 mb-6 relative"
          >
            <Zap className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 rounded-xl bg-primary/10 blur-xl" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            DOMINION
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide uppercase">
            {isLogin ? "Access Your System" : "Initialize New Instance"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card-elevated p-8 power-border">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                className="bg-secondary/60 border-border/60 h-12 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/60 border-border/60 h-12 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 btn-power rounded-lg font-semibold text-base gap-2 tracking-wide"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Enter System" : "Initialize"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/40 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                console.log("Toggling auth mode, current isLogin:", isLogin);
                setIsLogin(!isLogin);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isLogin ? "No access? " : "Already initialized? "}
              <span className="text-primary font-medium ml-1">
                {isLogin ? "Request access" : "Sign in"}
              </span>
            </Button>
          </div>
        </div>

        {/* Power Metrics */}
        <div className="mt-8 grid grid-cols-3 gap-3 stagger-children">
          <div className="p-4 rounded-lg bg-card/50 border border-border/30 text-center">
            <p className="text-2xl font-mono font-bold text-primary mb-1">∞</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Scale</p>
          </div>
          <div className="p-4 rounded-lg bg-card/50 border border-border/30 text-center">
            <p className="text-2xl font-mono font-bold text-success mb-1">24/7</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Operate</p>
          </div>
          <div className="p-4 rounded-lg bg-card/50 border border-border/30 text-center">
            <p className="text-2xl font-mono font-bold text-accent mb-1">AI</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Intelligence</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-center text-xs text-muted-foreground/60 tracking-wide">
          Replace agencies. Eliminate labor. Compound revenue.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
