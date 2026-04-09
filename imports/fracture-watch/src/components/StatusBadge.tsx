import type { StatusLevel } from "@/data/types";

interface StatusBadgeProps {
  status: StatusLevel;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const statusColors: Record<StatusLevel, string> = {
  Red: "text-status-red border-status-red/25",
  Amber: "text-status-amber border-status-amber/25",
  Mixed: "text-status-mixed border-status-mixed/25",
  Watching: "text-status-blue border-status-blue/25",
  Active: "text-status-green border-status-green/25",
  Tripwire: "text-status-red border-status-red/30",
  Critical: "text-status-red border-status-red/35",
  Green: "text-status-green border-status-green/25",
};

const sizeClasses = {
  sm: "px-1.5 py-px text-[9px]",
  md: "px-2 py-0.5 text-[10px]",
  lg: "px-2.5 py-1 text-xs",
};

export function StatusBadge({ status, size = "md", pulse }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-medium uppercase tracking-wider border rounded ${statusColors[status]} ${sizeClasses[size]}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${status === "Red" ? "bg-status-red" : status === "Amber" ? "bg-status-amber" : "bg-status-blue"}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === "Red" ? "bg-status-red" : status === "Amber" ? "bg-status-amber" : "bg-status-blue"}`} />
        </span>
      )}
      {status}
    </span>
  );
}
