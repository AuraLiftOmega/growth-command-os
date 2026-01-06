import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);

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
        const { error } = await supabase.auth.signUp({
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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0a0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#fff",
            marginBottom: "8px"
          }}>
            DOMINION
          </h1>
          <p style={{ color: "#888", fontSize: "14px", textTransform: "uppercase" }}>
            {isLogin ? "Access Your System" : "Create Account"}
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: "#111114",
          border: "1px solid #222",
          borderRadius: "12px",
          padding: "32px"
        }}>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: "20px" }}>
              <label 
                htmlFor="auth-email"
                style={{
                  display: "block",
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "8px"
                }}
              >
                Email
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 16px",
                  fontSize: "16px",
                  backgroundColor: "#1a1a1e",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  color: "#fff",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "24px" }}>
              <label 
                htmlFor="auth-password"
                style={{
                  display: "block",
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "8px"
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "0 48px 0 16px",
                    fontSize: "16px",
                    backgroundColor: "#1a1a1e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#fff",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#888",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: "#dc2626",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          {/* Toggle */}
          <div style={{
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #222",
            textAlign: "center"
          }}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {isLogin ? "Need an account? " : "Have an account? "}
              <span style={{ color: "#dc2626", textDecoration: "underline" }}>
                {isLogin ? "Sign up" : "Sign in"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
