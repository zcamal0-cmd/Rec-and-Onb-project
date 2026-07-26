import { cn } from "@/lib/utils";
import { statusTone } from "@/lib/sections";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone(status);
  const tones: Record<string, string> = {
    success: "bg-success/15 text-success-foreground border-success/30",
    danger: "bg-destructive/10 text-destructive border-destructive/30",
    info: "bg-info/15 text-info-foreground border-info/30",
    warning: "bg-warning/15 text-warning-foreground border-warning/30",
    muted: "bg-muted text-muted-foreground border-border",
    default: "bg-accent text-accent-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
