export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent/90",
  secondary: "bg-surface text-foreground border border-border hover:bg-surface-hover",
  ghost: "bg-transparent text-foreground hover:bg-surface-hover",
};

export const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export const BASE_BUTTON_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium shadow-sm transition-colors duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
