import { forwardRef, type InputHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${className ?? ""}`}
      {...props}
    />
  );
});
