import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";

import { firebaseApp } from "./firebase";

// Reutilizamos la misma aplicación de Firebase que utiliza Authentication.
export const db = getFirestore(firebaseApp);

// -----------------------------------------
// TIPO DE TEMA
// -----------------------------------------
export type TemaPreferido =
  | "light"
  | "dark"
  | "system";

// -----------------------------------------
// GUARDA INFORMACIÓN GENÉRICA
// -----------------------------------------
export async function guardarDocumento(
    coleccion: string,
    uid: string,
    datos: Record<string, any>
) {
    const referencia = doc(collection(db, coleccion));

    await setDoc(referencia, {
        ...datos,
        uid,
        fechaCreacion: serverTimestamp(),
    });

    return referencia.id;
}

// Obtiene los documentos que pertenecen a un usuario.
export async function obtenerDocumentos(
    coleccion: string,
    uid: string
) {
    const consulta = query(
        collection(db, coleccion),
        where("uid", "==", uid)
    );

    const resultado = await getDocs(consulta);

    return resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data(),
    }));
}

// Obtiene un documento específico.
export async function obtenerDocumento(
    coleccion: string,
    id: string
) {
    const referencia = doc(db, coleccion, id);
    const resultado = await getDoc(referencia);

    if (!resultado.exists()) {
        return null;
    }

    return {
        id: resultado.id,
        ...resultado.data(),
    };
}

// -----------------------------------------
// GUARDAR PREFERENCIA DEL TEMA
// -----------------------------------------
export async function guardarPreferenciaTema(
  uid: string,
  tema: TemaPreferido
) {
  const referencia = doc(
    db,
    "preferencias_usuario",
    uid
  );

  await setDoc(
    referencia,
    {
      uid,
      tema,
      fechaActualizacion:
        serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

// -----------------------------------------
// OBTENER PREFERENCIA DEL TEMA
// -----------------------------------------
export async function obtenerPreferenciaTema(
  uid: string
): Promise<TemaPreferido> {
  const referencia = doc(
    db,
    "preferencias_usuario",
    uid
  );

  const resultado =
    await getDoc(referencia);

  // Si todavía no existe configuración,
  // se usa el tema del dispositivo.
  if (!resultado.exists()) {
    return "system";
  }

  const datos =
    resultado.data();

  const tema =
    datos.tema;

  if (
    tema === "light" ||
    tema === "dark" ||
    tema === "system"
  ) {
    return tema;
  }

  return "system";
}