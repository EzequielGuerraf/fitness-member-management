import type { ReactNode } from "react";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="state" role="status">
      <h3 className="state__title">{title}</h3>
      <p className="state__description">{description}</p>
      {action}
    </div>
  );
}
