const API_URL = "http://localhost:3001";

export async function obtenerTratamientos() {
  const response = await fetch(`${API_URL}/tratamientos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los tratamientos");
  }

  return response.json();
}