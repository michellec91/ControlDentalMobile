import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { firebaseAuth } from "../services/firebase";
import { API_URL } from "../services/api";

// id_usuario es el ID numérico ANTIGUO de MySQL. 0 significa que aún no
// se ha vinculado con esa base de datos. NUNCA usar el uid como número.
export type User = {
  uid: string;
  id_usuario: number;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: string;
  imagen_perfil?: string | null;
};

type DatosRegistro = {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
};

type AuthContextType = {
  usuario: User | null;
  cargandoSesion: boolean;
  login: (correo: string, password: string) => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  actualizarUsuario: (cambios: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  // Se usa solo al consultar o guardar citas: no bloquea el login Firebase.
  obtenerIdUsuario: () => Promise<number>;
};

const AuthContext = createContext<AuthContextType | null>(null);
const KEY = "controldental_perfil_firebase_";

// Solo guardamos información de perfil no sensible en el dispositivo.
// Los datos persistentes del proyecto se pasarán a Firestore en la rama correspondiente.
async function mapearUsuario(fb: FirebaseUser): Promise<User> {
  let local: Partial<User> = {};
  try {
    const texto = await AsyncStorage.getItem(KEY + fb.uid);
    if (texto) local = JSON.parse(texto) as Partial<User>;
  } catch (error) {
    console.warn("No se pudo leer el perfil local", error);
  }
  const partes = (fb.displayName || "").trim().split(/\s+/).filter(Boolean);
  return {
    uid: fb.uid,
    id_usuario: 0,
    nombre: local.nombre || partes[0] || "Paciente",
    apellido: local.apellido || partes.slice(1).join(" "),
    correo: fb.email || "",
    telefono: local.telefono || fb.phoneNumber || "",
    rol: "Paciente",
    estado: "Activo",
    imagen_perfil: local.imagen_perfil ?? fb.photoURL ?? null,
  };
}

export function mensajeErrorFirebase(error: unknown): string {
  const codigo = (error as { code?: string })?.code;
  const mensajes: Record<string, string> = {
    "auth/email-already-in-use": "Este correo ya está registrado.",
    "auth/invalid-email": "Ingresá un correo válido.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "Correo o contraseña incorrectos.",
    "auth/weak-password": "La contraseña no cumple los requisitos de seguridad.",
    "auth/too-many-requests": "Demasiados intentos. Probá nuevamente más tarde.",
    "auth/network-request-failed": "No hay conexión con Firebase. Verificá Internet.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/operation-not-allowed": "Activá Correo/Contraseña en Firebase Authentication.",
    "auth/requires-recent-login": "Por seguridad, cerrá sesión e ingresá nuevamente.",
  };
  return (codigo && mensajes[codigo]) ||
    (error instanceof Error ? error.message : "Ocurrió un error de autenticación.");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    let vigente = true;
    // Firebase restaura la sesión desde AsyncStorage al iniciar la aplicación.
    const desuscribir = onAuthStateChanged(firebaseAuth, async (fb) => {
      try {
        const perfil = fb ? await mapearUsuario(fb) : null;
        if (vigente) setUsuario(perfil);
      } catch (error) {
        console.error("Error al restaurar sesión Firebase", error);
        if (vigente) setUsuario(null);
      } finally {
        if (vigente) setCargandoSesion(false);
      }
    });
    return () => { vigente = false; desuscribir(); };
  }, []);

  const login = async (correo: string, password: string) => {
    const credencial = await signInWithEmailAndPassword(
      firebaseAuth,
      correo.trim().toLowerCase(),
      password
    );
    setUsuario(await mapearUsuario(credencial.user));
  };

  const registrar = async (datos: DatosRegistro) => {
    const credencial = await createUserWithEmailAndPassword(
      firebaseAuth,
      datos.correo.trim().toLowerCase(),
      datos.password
    );
    try {
      await updateProfile(credencial.user, {
        displayName: `${datos.nombre.trim()} ${datos.apellido.trim()}`.trim(),
      });
      const perfil = {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        telefono: datos.telefono.trim(),
      };
      await AsyncStorage.setItem(KEY + credencial.user.uid, JSON.stringify(perfil));
      setUsuario(await mapearUsuario(credencial.user));
    } catch (error) {
      console.warn("La cuenta se creó, pero faltó guardar algún dato del perfil", error);
      setUsuario(await mapearUsuario(credencial.user));
    }
    // Firebase inicia sesión automáticamente después del registro.
  };

  const actualizarUsuario = async (cambios: Partial<User>) => {
    const fb = firebaseAuth.currentUser;
    if (!fb || !usuario) throw new Error("No existe una sesión activa.");
    if (cambios.correo && cambios.correo !== fb.email) {
      throw new Error("El cambio de correo requiere verificación y aún no está implementado.");
    }
    const siguiente: User = {
      ...usuario,
      ...cambios,
      uid: fb.uid,
      id_usuario: usuario.id_usuario,
      correo: fb.email || "",
    };
    if (cambios.nombre !== undefined || cambios.apellido !== undefined) {
      await updateProfile(fb, {
        displayName: `${siguiente.nombre} ${siguiente.apellido || ""}`.trim(),
      });
    }
    await AsyncStorage.setItem(KEY + fb.uid, JSON.stringify({
      nombre: siguiente.nombre,
      apellido: siguiente.apellido,
      telefono: siguiente.telefono,
      imagen_perfil: siguiente.imagen_perfil,
    }));
    setUsuario(siguiente);
  };

  // Vincula la cuenta autenticada con MySQL solo cuando hace falta.
  // Firebase sigue siendo independiente: un fallo de API nunca bloquea el login.
  const obtenerIdUsuario = useCallback(async (): Promise<number> => {
    const fb = firebaseAuth.currentUser;
    if (!fb || !usuario || fb.uid !== usuario.uid) {
      throw new Error("Debes iniciar sesión para gestionar tus citas.");
    }
    if (usuario.id_usuario > 0) return usuario.id_usuario;

    const token = await fb.getIdToken();
    let respuesta: Response;
    try {
      respuesta = await fetch(`${API_URL}/usuarios/firebase-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: usuario.nombre,
          apellido: usuario.apellido || "",
          telefono: usuario.telefono || "",
        }),
      });
    } catch {
      throw new Error("No se pudo conectar con la API para identificar tu cuenta.");
    }
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      throw new Error(datos.error || "No se pudo vincular tu cuenta con las citas.");
    }
    const id = Number(datos.id_usuario);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("La API no devolvió un identificador válido de usuario.");
    }
    setUsuario((actual) =>
      actual?.uid === fb.uid ? { ...actual, id_usuario: id } : actual,
    );
    return id;
  }, [usuario]);

  const logout = async () => {
    await signOut(firebaseAuth);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario, cargandoSesion, login, registrar, actualizarUsuario, logout, obtenerIdUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
