import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Check, Droplets, BookOpen, Dumbbell, Sun, Camera, Wine } from "lucide-react";

import habitDiet from "@/assets/habit-diet.jfif";
import habitWater from "@/assets/habit-water.jfif";
import habitReading from "@/assets/habit-reading.jfif";
import habitWorkout1 from "@/assets/habit-workout1.jfif";
import habitWorkout2 from "@/assets/habit-workout2.jfif";
import habitPhoto from "@/assets/habit-photo.jfif";
import habitAlcohol from "@/assets/habit-alcohol.jfif";

interface CheckinData {
  diet: boolean;
  water: boolean;
  reading: boolean;
  workout1: boolean;
  workout2_outdoor: boolean;
  progress_photo: boolean;
  no_alcohol: boolean;
}

const TASKS = [
  { key: "diet" as keyof CheckinData, label: "Follow a healthy diet", icon: Check, desc: "No cheat meals", bg: habitDiet },
  { key: "water" as keyof CheckinData, label: "Drink 1 gallon of water", icon: Droplets, desc: "Stay hydrated", bg: habitWater },
  { key: "reading" as keyof CheckinData, label: "Read 10 pages", icon: BookOpen, desc: "Non-fiction book", bg: habitReading },
  { key: "workout1" as keyof CheckinData, label: "Workout #1 (45 min)", icon: Dumbbell, desc: "Any workout", bg: habitWorkout1 },
  { key: "workout2_outdoor" as keyof CheckinData, label: "Workout #2 Outdoor (45 min)", icon: Sun, desc: "Must be outside", bg: habitWorkout2 },
  { key: "progress_photo" as keyof CheckinData, label: "Take a progress photo", icon: Camera, desc: "Document your journey", bg: habitPhoto },
  { key: "no_alcohol" as keyof CheckinData, label: "No alcohol", icon: Wine, desc: "Stay disciplined", bg: habitAlcohol },
];

interface Props {
  onUpdate?: () => void;
}

const DailyChecklist = ({ onUpdate }: Props) => {
  const { user } = useAuth();
  const [checkin, setCheckin] = useState<CheckinData>({
    diet: false, water: false, reading: false,
    workout1: false, workout2_outdoor: false,
    progress_photo: false, no_alcohol: false,
  });
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone

  useEffect(() => {
    if (!user) return;
    loadCheckin();
  }, [user]);

  const loadCheckin = async () => {
    const { data } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user!.id)
      .eq("check_date", today)
      .maybeSingle();

    if (data) {
      setCheckin({
        diet: data.diet, water: data.water, reading: data.reading,
        workout1: data.workout1, workout2_outdoor: data.workout2_outdoor,
        progress_photo: data.progress_photo, no_alcohol: data.no_alcohol,
      });
    }
  };

  const toggleTask = async (key: keyof CheckinData) => {
    const newVal = !checkin[key];
    const updated = { ...checkin, [key]: newVal };
    setCheckin(updated);
    setAnimatingKey(key);
    setTimeout(() => setAnimatingKey(null), 400);

    const { data: existing } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", user!.id)
      .eq("check_date", today)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("daily_checkins")
        .update({ [key]: newVal })
        .eq("id", existing.id);
    } else {
      await supabase.from("daily_checkins").insert({
        user_id: user!.id,
        check_date: today,
        ...updated,
      });
    }

    onUpdate?.();
  };

  const completedCount = Object.values(checkin).filter(Boolean).length;
  const allDone = completedCount === 7;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl text-foreground tracking-wide">TODAY'S TASKS</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${allDone ? "gradient-green text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
          {completedCount}/7
        </span>
      </div>

      {/* Changed to a grid layout to make square/tall cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {TASKS.map((task, i) => {
          const done = checkin[task.key];
          const Icon = task.icon;
          return (
            <button
              key={task.key}
              onClick={() => toggleTask(task.key)}
              className={`w-full aspect-[4/5] flex flex-col justify-end p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${done
                ? "border-primary text-foreground"
                : "border-border/50 text-foreground hover:border-primary/50"
                }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Background Image Layer - Now shows almost the whole image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${task.bg})` }}
              />

              {/* Gradient Overlay just at the bottom for text readability */}
              <div
                className={`absolute inset-0 transition-all duration-300 ${done ? "bg-black/40" : "bg-gradient-to-t from-black/80 via-black/10 to-transparent group-hover:from-black/90"}`}
              />

              {/* Content Container positioned at the bottom */}
              <div className="relative z-10 flex flex-col items-start gap-3 w-full text-left">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${done ? "gradient-green glow-green" : "bg-white/10 backdrop-blur-md border border-white/20"
                    } ${animatingKey === task.key ? "animate-check" : ""}`}
                >
                  {done ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-base font-bold transition-all tracking-wide ${done ? "text-white line-through opacity-60" : "text-white drop-shadow-md"}`}>
                    {task.label}
                  </p>
                  <p className="text-xs font-medium text-white/70 drop-shadow-md mt-0.5 line-clamp-1">{task.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyChecklist;
