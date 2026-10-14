import { Platform } from "react-native";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:3001"
    : "http://localhost:3001");

export async function obtenerTratamientos() {
  const response = await fetch(`${API_URL}/tratamientos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los tratamientos");
  }

  return response.json();
}