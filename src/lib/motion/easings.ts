export const EASINGS = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const SPRINGS = {
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.8 },
  number: { type: "spring", stiffness: 200, damping: 24, mass: 0.5 },
} as const;

export const DURATION = {
  fast: 0.15,
  base: 0.2,
  medium: 0.3,
  slow: 0.45,
} as const;
