import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

export type User = {
  id_usuario: number;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: string;
  imagen_perfil?: string | null;
};

type AuthContextType = {
  usuario: User | null;
  cargandoSesion: boolean;

  login: (
    userData: User
  ) => Promise<void>;

  actualizarUsuario: (
    userData: Partial<User>
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | null>(
    null
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    usuario,
    setUsuario,
  ] =
    useState<User | null>(
      null
    );

  const [
    cargandoSesion,
    setCargandoSesion,
  ] =
    useState(true);

  // -----------------------------------------
  // CARGAR SESIÓN GUARDADA
  // -----------------------------------------
  useEffect(() => {
    const cargarSesion =
      async () => {
        try {
          const usuarioGuardado =
            await AsyncStorage.getItem(
              "usuario"
            );

          if (
            usuarioGuardado
          ) {
            const usuarioParseado =
              JSON.parse(
                usuarioGuardado
              );

            setUsuario(
              usuarioParseado
            );
          }
        } catch (error) {
          console.error(
            "Error al cargar la sesión:",
            error
          );

          await AsyncStorage.removeItem(
            "usuario"
          );

          setUsuario(null);
        } finally {
          setCargandoSesion(
            false
          );
        }
      };

    cargarSesion();
  }, []);

  // -----------------------------------------
  // INICIAR SESIÓN
  // -----------------------------------------
  const login = async (
    userData: User
  ) => {
    try {
      const usuarioNormalizado: User =
        {
          id_usuario:
            Number(
              userData.id_usuario
            ),

          nombre:
            userData.nombre,

          apellido:
            userData.apellido ||
            "",

          correo:
            userData.correo,

          telefono:
            userData.telefono ||
            "",

          rol:
            userData.rol,

          estado:
            userData.estado,

          imagen_perfil:
            userData.imagen_perfil ||
            null,
        };

      setUsuario(
        usuarioNormalizado
      );

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(
          usuarioNormalizado
        )
      );
    } catch (error) {
      console.error(
        "Error al guardar la sesión:",
        error
      );

      throw error;
    }
  };

  // -----------------------------------------
  // ACTUALIZAR DATOS DEL USUARIO EN SESIÓN
  // -----------------------------------------
  const actualizarUsuario =
    async (
      userData: Partial<User>
    ) => {
      try {
        if (!usuario) {
          throw new Error(
            "No existe una sesión activa."
          );
        }

        const usuarioActualizado: User =
          {
            ...usuario,
            ...userData,
          };

        setUsuario(
          usuarioActualizado
        );

        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify(
            usuarioActualizado
          )
        );
      } catch (error) {
        console.error(
          "Error al actualizar la sesión:",
          error
        );

        throw error;
      }
    };

  // -----------------------------------------
  // CERRAR SESIÓN
  // -----------------------------------------
  const logout =
    async () => {
      try {
        setUsuario(null);

        await AsyncStorage.removeItem(
          "usuario"
        );
      } catch (error) {
        console.error(
          "Error al cerrar la sesión:",
          error
        );

        throw error;
      }
    };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        login,
        actualizarUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
};