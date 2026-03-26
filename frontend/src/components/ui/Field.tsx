import type { ReactNode } from "react";

interface FieldProps {
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
}

export function Field({
  children,
  error,
  hint,
  htmlFor,
  label
}: FieldProps) {
  return (
    <div className="field">
      <div className="field__header">
        <label className="field__label" htmlFor={htmlFor}>
          {label}
        </label>
        {hint ? <span className="field__hint">{hint}</span> : null}
      </div>
      {children}
      {error ? <span className="field__error">{error}</span> : null}
    </div>
  );
}
