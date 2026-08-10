import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="panel flex items-start justify-between gap-4 p-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
    </div>
  );
}
