import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { firebaseAuth } from "../services/firebase";
import { API_URL } from "../services/api";
import { Platform } from "react-native";

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

type DatosPerfil = {
  nombre: string;
  apellido: string;
  telefono: string;
};

export type EstadoRegistro =
  | "sin_sesion"
  | "verificando"
  | "pendiente"
  | "completo"
  | "error";

type AuthContextType = {
  usuario: User | null;
  cargandoSesion: boolean;
  estadoRegistro: EstadoRegistro;
  errorRegistro: string | null;
  login: (correo: string, password: string) => Promise<void>;
  loginConGoogle: () => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  completarRegistro: (datos: DatosPerfil) => Promise<void>;
  verificarRegistro: () => Promise<void>;
  actualizarUsuario: (cambios: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  // Se usa solo al consultar o guardar citas: no bloquea el login Firebase.
  obtenerIdUsuario: () => Promise<number>;
};

type PerfilBackend = Partial<Pick<
  User,
  | "id_usuario"
  | "nombre"
  | "apellido"
  | "correo"
  | "telefono"
  | "rol"
  | "estado"
  | "imagen_perfil"
>>;

type RespuestaSync = {
  id_usuario?: number;
  registrado?: boolean;
  requiereRegistro?: boolean;
  error?: string;
  perfil?: PerfilBackend;
};

type ResultadoSync = {
  estado: "pendiente" | "completo";
  idUsuario: number;
  perfil?: PerfilBackend;
  mensaje?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

const KEY = "controldental_perfil_firebase_";

// Solo guardamos información de perfil no sensible en el dispositivo.
// Los datos persistentes del proyecto se pasarán a Firestore en la rama correspondiente.
async function mapearUsuario(fb: FirebaseUser): Promise<User> {
  let local: Partial<User> = {};

  try {
    const texto = await AsyncStorage.getItem(KEY + fb.uid);

    if (texto) {
      local = JSON.parse(texto) as Partial<User>;
    }
  } catch (error) {
    console.warn("No se pudo leer el perfil local", error);
  }

  const partes = (fb.displayName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

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

function aplicarPerfilBackend(
  base: User,
  remoto?: PerfilBackend,
  idUsuario = 0
): User {
  if (!remoto) {
    return { ...base, id_usuario: idUsuario };
  }

  return {
    ...base,
    id_usuario: idUsuario,
    nombre: remoto.nombre || base.nombre,
    apellido: remoto.apellido ?? base.apellido,
    correo: remoto.correo || base.correo,
    telefono: remoto.telefono ?? base.telefono,
    rol: remoto.rol || base.rol,
    estado: remoto.estado || base.estado,
    imagen_perfil: remoto.imagen_perfil ?? base.imagen_perfil,
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
    "auth/operation-not-allowed": "El proveedor de inicio de sesión no está habilitado.",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google.",
    "auth/popup-blocked": "El navegador bloqueó la ventana de Google.",
    "auth/requires-recent-login": "Por seguridad, cerrá sesión e ingresá nuevamente.",
  };

  return (
    (codigo && mensajes[codigo]) ||
    (error instanceof Error
      ? error.message
      : "Ocurrió un error de autenticación.")
  );
}

async function sincronizarConMySQL(
  fb: FirebaseUser,
  datos?: DatosPerfil,
  completarPerfil = false
): Promise<ResultadoSync> {
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
        ...(datos ?? {}),
        completarPerfil,
      }),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el backend. Verificá la API y tu conexión."
    );
  }

  const resultado = (
    await respuesta.json().catch(() => ({}))
  ) as RespuestaSync;

  // Registro incompleto
  if (
    respuesta.status === 422 &&
    resultado.requiereRegistro === true
  ) {
    return {
      estado: "pendiente",
      idUsuario: 0,
      perfil: resultado.perfil,
      mensaje: resultado.error,
    };
  }

  // Otros errores del backend
  if (!respuesta.ok) {
    throw new Error(
      resultado.error || "No se pudo verificar el registro del paciente."
    );
  }

  const idUsuario = Number(resultado.id_usuario);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new Error(
      "El backend no devolvió un ID válido de MySQL."
    );
  }

  return {
    estado: "completo",
    idUsuario,
    perfil: resultado.perfil,
  };
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] = useState<User | null>(null);

  const [cargandoSesion, setCargandoSesion] = useState(true);

  const [estadoRegistro, setEstadoRegistro] =
    useState<EstadoRegistro>("verificando");

  const [errorRegistro, setErrorRegistro] =
    useState<string | null>(null);

  const revision = useRef(0);

  // --------------------------------------------------
  // VERIFICAR SESIÓN Y REGISTRO
  // --------------------------------------------------
  const verificarSesion = useCallback(
    async (fb: FirebaseUser | null) => {
      const actual = ++revision.current;

      setCargandoSesion(true);
      setErrorRegistro(null);

      if (!fb) {
        setUsuario(null);
        setEstadoRegistro("sin_sesion");
        setCargandoSesion(false);
        return;
      }

      setEstadoRegistro("verificando");

      try {
        const base = await mapearUsuario(fb);
        const resultado = await sincronizarConMySQL(fb);

        if (actual !== revision.current) return;

        setUsuario(
          aplicarPerfilBackend(
            base,
            resultado.perfil,
            resultado.idUsuario
          )
        );

        setEstadoRegistro(resultado.estado);
      } catch (error) {
        if (actual !== revision.current) return;

        const base = await mapearUsuario(fb);

        if (actual !== revision.current) return;

        setUsuario(base);
        setEstadoRegistro("error");
        setErrorRegistro(mensajeErrorFirebase(error));
      } finally {
        if (actual === revision.current) {
          setCargandoSesion(false);
        }
      }
    },
    []
  );

  // --------------------------------------------------
  // RECUPERAR SESIÓN DE FIREBASE
  // --------------------------------------------------
  useEffect(() => {
    const desuscribir = onAuthStateChanged(
      firebaseAuth,
      (fb) => {
        void verificarSesion(fb);
      }
    );

    return () => {
      ++revision.current;
      desuscribir();
    };
  }, [verificarSesion]);

  const verificarRegistro = async () => {
    await verificarSesion(firebaseAuth.currentUser);
  };

  // --------------------------------------------------
  // LOGIN CON CORREO
  // --------------------------------------------------
  const login = async (correo: string, password: string) => {
    await signInWithEmailAndPassword(
      firebaseAuth,
      correo.trim().toLowerCase(),
      password
    );
  };

  // --------------------------------------------------
  // LOGIN CON GOOGLE
  // --------------------------------------------------
  const loginConGoogle = async () => {
    if (Platform.OS !== "web") {
      throw new Error(
        "Google Sign-In está disponible por ahora solo en la versión web."
      );
    }

    const proveedor = new GoogleAuthProvider();

    proveedor.setCustomParameters({
      prompt: "select_account",
    });

    await signInWithPopup(
      firebaseAuth,
      proveedor,
      browserPopupRedirectResolver
    );
  };

  // --------------------------------------------------
  // COMPLETAR REGISTRO EN MYSQL
  // --------------------------------------------------
  const completarRegistro = async (datos: DatosPerfil) => {
    const fb = firebaseAuth.currentUser;

    if (!fb) {
      throw new Error(
        "Debes iniciar sesión antes de completar tu registro."
      );
    }

    const actual = ++revision.current;

    setCargandoSesion(true);
    setEstadoRegistro("verificando");
    setErrorRegistro(null);

    try {
      const base = await mapearUsuario(fb);

      const resultado = await sincronizarConMySQL(
        fb,
        datos,
        true
      );

      if (resultado.estado !== "completo") {
        throw new Error(
          resultado.mensaje ||
          "Debes completar todos los campos del registro."
        );
      }

      // Guardar respaldo local del perfil
      await AsyncStorage.setItem(
        KEY + fb.uid,
        JSON.stringify(datos)
      );

      try {
        await updateProfile(fb, {
          displayName:
            `${datos.nombre.trim()} ${datos.apellido.trim()}`.trim(),
        });
      } catch (error) {
        console.warn(
          "MySQL guardó el perfil, pero no se actualizó el nombre en Firebase.",
          error
        );
      }

      if (actual !== revision.current) return;

      setUsuario(
        aplicarPerfilBackend(
          base,
          resultado.perfil,
          resultado.idUsuario
        )
      );

      setEstadoRegistro("completo");
    } catch (error) {
      if (actual === revision.current) {
        setEstadoRegistro("pendiente");
        setErrorRegistro(mensajeErrorFirebase(error));
      }

      throw error;
    } finally {
      if (actual === revision.current) {
        setCargandoSesion(false);
      }
    }
  };

  // --------------------------------------------------
  // REGISTRAR CON CORREO Y CONTRASEÑA
  // --------------------------------------------------
  const registrar = async (datos: DatosRegistro) => {
    await createUserWithEmailAndPassword(
      firebaseAuth,
      datos.correo.trim().toLowerCase(),
      datos.password
    );

    const perfil = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      telefono: datos.telefono.trim(),
    };

    // Sincronizar también los registros tradicionales
    await completarRegistro(perfil);
  };

  // --------------------------------------------------
  // ACTUALIZAR INFORMACIÓN DEL USUARIO
  // --------------------------------------------------
  const actualizarUsuario = async (
    cambios: Partial<User>
  ) => {
    const fb = firebaseAuth.currentUser;

    if (!fb || !usuario) {
      throw new Error("No existe una sesión activa.");
    }

    if (cambios.correo && cambios.correo !== fb.email) {
      throw new Error(
        "El cambio de correo requiere verificación y aún no está implementado."
      );
    }

    const siguiente: User = {
      ...usuario,
      ...cambios,
      uid: fb.uid,
      id_usuario: usuario.id_usuario,
      correo: fb.email || "",
    };

    if (
      cambios.nombre !== undefined ||
      cambios.apellido !== undefined
    ) {
      await updateProfile(fb, {
        displayName:
          `${siguiente.nombre} ${siguiente.apellido || ""}`.trim(),
      });
    }

    await AsyncStorage.setItem(
      KEY + fb.uid,
      JSON.stringify({
        nombre: siguiente.nombre,
        apellido: siguiente.apellido,
        telefono: siguiente.telefono,
        imagen_perfil: siguiente.imagen_perfil,
      })
    );

    setUsuario(siguiente);

    // La edición general del perfil todavía necesita
    // integrarse con una ruta protegida de MySQL.
  };

  // --------------------------------------------------
  // OBTENER ID DEL USUARIO EN MYSQL
  // --------------------------------------------------
  const obtenerIdUsuario = useCallback(
    async (): Promise<number> => {
      const fb = firebaseAuth.currentUser;

      if (!fb || !usuario || fb.uid !== usuario.uid) {
        throw new Error(
          "Debes iniciar sesión para gestionar tus citas."
        );
      }

      if (
        estadoRegistro !== "completo" ||
        usuario.id_usuario <= 0
      ) {
        throw new Error(
          "Debes completar tu registro antes de gestionar citas."
        );
      }

      return usuario.id_usuario;
    },
    [usuario, estadoRegistro]
  );

  // --------------------------------------------------
  // CERRAR SESIÓN
  // --------------------------------------------------
  const logout = async () => {
    ++revision.current;

    await signOut(firebaseAuth);

    setUsuario(null);
    setEstadoRegistro("sin_sesion");
    setErrorRegistro(null);
    setCargandoSesion(false);
  };

  // --------------------------------------------------
  // CONTEXTO
  // --------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        estadoRegistro,
        errorRegistro,
        login,
        loginConGoogle,
        registrar,
        completarRegistro,
        verificarRegistro,
        actualizarUsuario,
        logout,
        obtenerIdUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider."
    );
  }

  return context;
}
