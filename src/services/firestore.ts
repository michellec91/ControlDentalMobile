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

// Guarda información en una colección asociándola al usuario autenticado.
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