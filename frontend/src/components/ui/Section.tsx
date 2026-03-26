import type { ReactNode } from "react";

interface SectionProps {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}

export function Section({
  actions,
  children,
  description,
  title
}: SectionProps) {
  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2 className="section__title">{title}</h2>
          {description ? (
            <p className="section__description">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
