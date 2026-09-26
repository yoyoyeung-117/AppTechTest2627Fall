const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#F3F6FC",
  neutral700: "#DCE5F2",
  neutral600: "#94A3B8",
  neutral500: "#64748B",
  neutral400: "#475569",
  neutral300: "#334155",
  neutral200: "#152238",
  neutral100: "#0B1220",

  primary600: "#EAF1FF",
  primary500: "#BCD1FF",
  primary400: "#93B4FF",
  primary300: "#608EF2",
  primary200: "#1D4ED8",
  primary100: "#163DAD",

  secondary500: "#DCDDE9",
  secondary400: "#BCC0D6",
  secondary300: "#9196B9",
  secondary200: "#626894",
  secondary100: "#41476E",

  accent500: "#FFEED4",
  accent400: "#FFE1B2",
  accent300: "#FDD495",
  accent200: "#FBC878",
  accent100: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  palette,
  surface: "#152238",
  accentSurface: "#192F54",
  primaryAction: "#93B4FF",
  onPrimary: "#0B1220",
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textDim: palette.neutral600,
  background: palette.neutral100,
  border: palette.neutral400,
  tint: "#93B4FF",
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: "#FFAAA5",
  errorBackground: "#442027",
} as const
