export const lightColors = {
  // Identidad principal de los mockups
  primary: "#1890FF",
  primaryDark: "#126CC0",
  primaryLight: "#DEF4FE",

  // Azul profundo usado en botones/cards de tratamientos
  secondary: "#3F55A0",

  // Fondos originales
  background: "#F4FFFE",
  surface: "#FFF9F9",
  input: "#F6F7F9",

  // Texto
  text: "#1E1E1E",
  textSecondary: "#606060",

  // Bordes
  border: "#D9E2E2",

  // Básicos
  white: "#FFFFFF",
  black: "#000000",

  // Estados
  success: "#43C653",
  warning: "#FFF7AD",
  error: "#FF2828",

  // Extras para cards y overlays
  card: "#FFFFFF",
  overlay: "rgba(15, 23, 42, 0.5)",
};

export const darkColors = {
  // Identidad principal adaptada a oscuro
  primary: "#4DA3FF",
  primaryDark: "#2F85D8",
  primaryLight: "#163A59",

  // Azul secundario
  secondary: "#879BEB",

  // Fondos oscuros
  background: "#0F172A",
  surface: "#1E293B",
  input: "#273549",

  // Texto
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",

  // Bordes
  border: "#475569",

  // Básicos
  white: "#FFFFFF",
  black: "#000000",

  // Estados
  success: "#4ADE80",
  warning: "#FACC15",
  error: "#FF6B6B",

  // Extras
  card: "#1E293B",
  overlay: "rgba(0, 0, 0, 0.7)",
};

export const themes = {
  light: lightColors,
  dark: darkColors,
};

export type AppThemeColors =
  typeof lightColors;

export type AppThemeMode =
  | "light"
  | "dark";

export type ThemePreference =
  | "light"
  | "dark"
  | "system";

// Compatibilidad temporal con las pantallas
// que todavía usan:
// import { colors } from "../constants/theme";
export const colors =
  lightColors;