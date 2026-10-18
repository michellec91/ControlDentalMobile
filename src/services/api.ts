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

// Obtiene las citas del usuario que inició sesión.
export async function obtenerCitasPorUsuario(idUsuario: number) {
  const response = await fetch(
    `${API_URL}/citas?id_usuario=${idUsuario}`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener las citas");
  }

  return response.json();
}