type StatusPillTone = "neutral" | "positive" | "warning";

interface StatusPillProps {
  label: string;
  tone?: StatusPillTone;
}

export function StatusPill({
  label,
  tone = "neutral"
}: StatusPillProps) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}
