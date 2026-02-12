import { Flame } from "lucide-react";

interface Props {
  streak: number;
  currentDay: number;
}

const StreakCard = ({ streak, currentDay }: Props) => {
  const progress = (currentDay / 75) * 100;

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Streak */}
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${streak > 0 ? "bg-streak/20 streak-glow" : "bg-muted"}`}>
          <Flame className={`w-8 h-8 ${streak > 0 ? "text-streak" : "text-muted-foreground"}`} />
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Current Streak</p>
          <p className="font-display text-4xl text-foreground tracking-wide">
            {streak} <span className="text-lg text-muted-foreground">DAYS</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">Day {currentDay} of 75</p>
          <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-green rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-secondary rounded-xl">
          <p className="font-display text-2xl text-foreground">{currentDay}</p>
          <p className="text-xs text-muted-foreground">Day</p>
        </div>
        <div className="text-center p-3 bg-secondary rounded-xl">
          <p className="font-display text-2xl text-foreground">{75 - currentDay}</p>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
        <div className="text-center p-3 bg-secondary rounded-xl">
          <p className="font-display text-2xl text-streak">{streak}</p>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
