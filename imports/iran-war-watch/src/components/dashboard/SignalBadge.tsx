
import { Badge } from "@/components/ui/badge";
import { SignalLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SignalBadgeProps {
  level: SignalLevel;
  className?: string;
}

const levels = {
  low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  critical: "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
};

export function SignalBadge({ level, className }: SignalBadgeProps) {
  return (
    <Badge variant="outline" className={cn("capitalize px-2 py-0.5 font-semibold", levels[level], className)}>
      {level}
    </Badge>
  );
}
