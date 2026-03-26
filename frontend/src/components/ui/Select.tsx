import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function Select({
  className,
  hasError = false,
  ...props
}: SelectProps) {
  const classes = [
    "select",
    hasError ? "input--error" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return <select className={classes} {...props} />;
}
