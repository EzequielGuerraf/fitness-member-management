import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({
  children,
  className,
  padded = true,
  ...props
}: CardProps) {
  const classes = [
    "card",
    padded ? "card--padded" : "",
    className ?? ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}
