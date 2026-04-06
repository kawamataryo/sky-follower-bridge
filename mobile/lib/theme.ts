import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const colors = {
  // Backgrounds
  bg: {
    primary: "#0A0E1A",
    secondary: "#111827",
    card: "rgba(255, 255, 255, 0.06)",
    cardHover: "rgba(255, 255, 255, 0.10)",
    input: "rgba(255, 255, 255, 0.08)",
    overlay: "rgba(10, 14, 26, 0.85)",
  },

  // Gradients
  gradient: {
    aurora: ["#0A0E1A", "#0F1B3D", "#0A0E1A"] as const,
    accent: ["#0085FF", "#00C2FF", "#00E5A0"] as const,
    scanPulse: ["rgba(0, 133, 255, 0.3)", "rgba(0, 194, 255, 0.05)", "transparent"] as const,
    button: ["#0085FF", "#0066CC"] as const,
    danger: ["#FF4757", "#FF6B81"] as const,
  },

  // Text
  text: {
    primary: "#F8FAFC",
    secondary: "rgba(248, 250, 252, 0.6)",
    tertiary: "rgba(248, 250, 252, 0.35)",
    accent: "#00C2FF",
    inverse: "#0A0E1A",
  },

  // Accents
  accent: {
    blue: "#0085FF",
    cyan: "#00C2FF",
    teal: "#00E5A0",
    amber: "#FFB800",
    coral: "#FF6B6B",
    violet: "#A78BFA",
  },

  // Match type colors
  match: {
    handle: "#00C2FF",
    display_name: "#FFB800",
    description: "#A78BFA",
    none: "rgba(255, 255, 255, 0.2)",
  },

  // Borders
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    medium: "rgba(255, 255, 255, 0.12)",
    accent: "rgba(0, 133, 255, 0.3)",
  },

  // Status
  status: {
    success: "#00E5A0",
    error: "#FF4757",
    warning: "#FFB800",
  },
} as const;

export const typography = {
  // Using system font with specific weights for a clean mobile feel
  sizes: {
    hero: 36,
    h1: 28,
    h2: 22,
    h3: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    micro: 10,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    extraWide: 2,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: "#0085FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: "#00C2FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

export const SCREEN_WIDTH_PX = SCREEN_WIDTH;
