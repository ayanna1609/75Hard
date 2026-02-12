import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_EMAIL = "challenger@75hard.app";
export const DEFAULT_PASSWORD = "75HardChallenge!";

export async function ensureDefaultUser() {
  // Try to sign in first
  const { error } = await supabase.auth.signInWithPassword({
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD,
  });

  if (error) {
    // User doesn't exist, create it
    const { error: signUpError } = await supabase.auth.signUp({
      email: DEFAULT_EMAIL,
      password: DEFAULT_PASSWORD,
      options: {
        data: { display_name: "Challenger" },
      },
    });
    if (signUpError) throw signUpError;
  }
}

export function getDayNumber(startDate: string | null): number {
  if (!startDate) return 1;
  const start = new Date(startDate);
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diff + 1, 1), 75);
}

export function getStreak(checkins: any[]): number {
  if (!checkins.length) return 0;

  const sorted = [...checkins].sort(
    (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const checkDate = new Date(sorted[i].check_date);
    checkDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (checkDate.getTime() !== expectedDate.getTime()) break;

    const c = sorted[i];
    if (c.diet && c.water && c.reading && c.workout1 && c.workout2_outdoor && c.progress_photo && c.no_alcohol) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
