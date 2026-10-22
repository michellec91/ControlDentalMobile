import { Platform } from "react-native";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:3001"
    : "http://localhost:3001");

// -----------------------------------------
// TRATAMIENTOS
// -----------------------------------------
export async function obtenerTratamientos() {
  const response = await fetch(
    `${API_URL}/tratamientos`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No se pudieron obtener los tratamientos"
    );
  }

  return data;
}

// -----------------------------------------
// CITAS DEL USUARIO
// -----------------------------------------
export async function obtenerCitasPorUsuario(
  idUsuario: number
) {
  const response = await fetch(
    `${API_URL}/citas?id_usuario=${idUsuario}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No se pudieron obtener las citas"
    );
  }

  return data;
}

// -----------------------------------------
// HORARIOS
// -----------------------------------------
export async function obtenerHorarios() {
  const response = await fetch(
    `${API_URL}/horarios`
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No se pudieron obtener los horarios"
    );
  }

  return data;
}