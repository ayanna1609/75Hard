import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getDayNumber, getStreak } from "@/lib/supabase-helpers";
import DailyChecklist from "@/components/DailyChecklist";
import StreakCard from "@/components/StreakCard";
import ProgressPhotos from "@/components/ProgressPhotos";
import { LogOut, Trophy } from "lucide-react";
import img75hard2 from "@/assets/75hard2.jpg";
import download from "@/assets/download.jpg";
import download3 from "@/assets/download3.jpg";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [activeTab, setActiveTab] = useState<"tasks" | "photos">("tasks");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStreak();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setProfile(data);
    if (data?.start_date) {
      setCurrentDay(getDayNumber(data.start_date));
    }
  };

  const loadStreak = useCallback(async () => {
    const { data } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user!.id)
      .order("check_date", { ascending: false })
      .limit(75);
    setStreak(getStreak(data || []));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 relative">
      {/* Blurred background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 grid grid-cols-2 gap-0 opacity-15">
          <img src={download} alt="" className="w-full h-full object-cover blur-md" />
          <img src={download3} alt="" className="w-full h-full object-cover blur-md" />
        </div>
        <div className="absolute inset-0 bg-background/90" />
      </div>
      {/* Header */}
      <header className="relative z-10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={img75hard2} alt="75 Hard" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="font-display text-2xl text-foreground tracking-wide leading-none">
                75 <span className="text-gradient">HARD</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {profile?.display_name || "Challenger"}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Streak Card */}
        <StreakCard streak={streak} currentDay={currentDay} />

        {/* Motivational banner */}
        {streak >= 7 && (
          <div className="glass-card p-4 flex items-center gap-3 border-streak/30">
            <Trophy className="w-6 h-6 text-streak" />
            <p className="text-foreground text-sm font-medium">
              {streak >= 30
                ? "UNSTOPPABLE! You're a machine! 🔥"
                : streak >= 14
                ? "Two weeks strong! Keep pushing! 💪"
                : "One week down! Momentum is building! ⚡"}
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? "gradient-green text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily Tasks
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "photos"
                ? "gradient-green text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Progress Photos
          </button>
        </div>

        {/* Content */}
        <div className="animate-fade-up">
          {activeTab === "tasks" ? (
            <DailyChecklist onUpdate={loadStreak} />
          ) : (
            <ProgressPhotos />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
