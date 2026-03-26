import type { ReactNode } from "react";

interface ErrorStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function ErrorState({ action, description, title }: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <h3 className="state__title">{title}</h3>
      <p className="state__description">{description}</p>
      {action}
    </div>
  );
}
