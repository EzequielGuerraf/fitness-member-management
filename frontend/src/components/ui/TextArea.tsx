import type { TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function TextArea({
  className,
  hasError = false,
  ...props
}: TextAreaProps) {
  const classes = [
    "textarea",
    hasError ? "input--error" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return <textarea className={classes} {...props} />;
}
