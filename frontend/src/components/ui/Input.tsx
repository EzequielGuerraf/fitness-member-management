import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function Input({ className, hasError = false, ...props }: InputProps) {
  const classes = [
    "input",
    hasError ? "input--error" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
}
