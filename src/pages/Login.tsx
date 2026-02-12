import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_EMAIL, DEFAULT_PASSWORD, ensureDefaultUser } from "@/lib/supabase-helpers";
import heroBg from "@/assets/hero-bg.jpg";
import img75hard1 from "@/assets/75hard1.jpg";
import download1 from "@/assets/download1.jpg";
import download2 from "@/assets/download2.jpg";
import download3 from "@/assets/download3.jpg";

const Login = () => {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // If using default creds, ensure user exists
      if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
        await ensureDefaultUser();
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Blurred background photos collage */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 grid grid-cols-3 gap-0 opacity-20">
          <img src={heroBg} alt="" className="w-full h-full object-cover blur-sm" />
          <img src={download1} alt="" className="w-full h-full object-cover blur-sm" />
          <img src={download2} alt="" className="w-full h-full object-cover blur-sm" />
        </div>
        <div className="absolute inset-0 bg-background/85" />
      </div>

      {/* Left side - hero image */}
      <div className="relative z-10 lg:w-1/2 h-64 lg:h-auto overflow-hidden">
        <img
          src={heroBg}
          alt="75 Hard Challenge"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent lg:bg-gradient-to-r" />
        <div className="absolute bottom-6 left-6 lg:bottom-12 lg:left-12 z-10">
          <h1 className="font-display text-5xl lg:text-7xl text-foreground leading-none tracking-wider">
            75 <span className="text-gradient">HARD</span>
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base mt-2 max-w-xs">
            The ultimate mental toughness program
          </p>
        </div>
      </div>

      {/* Right side - login */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="font-display text-4xl text-foreground tracking-wide">
              WELCOME BACK
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to continue your challenge
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg gradient-green text-primary-foreground font-semibold text-lg glow-green hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "START THE GRIND"}
            </button>
          </form>

          <div className="glass-card p-4 flex items-center gap-4">
            <img src={img75hard1} alt="75 Hard" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="text-foreground text-sm font-medium">Default Login</p>
              <p className="text-muted-foreground text-xs">
                {DEFAULT_EMAIL} / {DEFAULT_PASSWORD}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
