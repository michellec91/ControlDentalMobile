import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useColorScheme,
} from "react-native";

import {
    AppThemeMode,
    darkColors,
    lightColors,
    ThemePreference,
} from "../constants/theme";

import { useAuth } from "./AuthContext";

import {
    guardarPreferenciaTema,
    obtenerPreferenciaTema,
} from "../services/firestore";

type ThemeContextType = {
  preferencia:
    ThemePreference;

  modoActual:
    AppThemeMode;

  colors:
    typeof lightColors;

  cargandoTema:
    boolean;

  cambiarTema: (
    tema:
      ThemePreference
  ) => Promise<void>;
};

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);

type Props = {
  children:
    ReactNode;
};

export function ThemeProvider({
  children,
}: Props) {
  const {
    usuario,
  } = useAuth();

  const esquemaSistema =
    useColorScheme();

  const [
    preferencia,
    setPreferencia,
  ] =
    useState<ThemePreference>(
      "system"
    );

  const [
    cargandoTema,
    setCargandoTema,
  ] =
    useState(true);

  // -----------------------------------------
  // CARGAR PREFERENCIA DESDE FIRESTORE
  // -----------------------------------------
  useEffect(() => {
    let activo =
      true;

    const cargarTema =
      async () => {
        // Si todavía no hay usuario,
        // dejamos el tema automático.
        if (!usuario?.uid) {
          if (activo) {
            setPreferencia(
              "system"
            );

            setCargandoTema(
              false
            );
          }

          return;
        }

        try {
          setCargandoTema(
            true
          );

          const temaGuardado =
            await obtenerPreferenciaTema(
              usuario.uid
            );

          if (activo) {
            setPreferencia(
              temaGuardado
            );
          }
        } catch (error) {
          console.error(
            "Error al cargar el tema:",
            error
          );

          if (activo) {
            setPreferencia(
              "system"
            );
          }
        } finally {
          if (activo) {
            setCargandoTema(
              false
            );
          }
        }
      };

    cargarTema();

    return () => {
      activo =
        false;
    };
  }, [
    usuario?.uid,
  ]);

  // -----------------------------------------
  // DETERMINAR TEMA REAL
  // -----------------------------------------
  const modoActual:
    AppThemeMode =
      preferencia ===
      "system"
        ? esquemaSistema ===
          "dark"
          ? "dark"
          : "light"
        : preferencia;

  // -----------------------------------------
  // COLORES DEL TEMA ACTUAL
  // -----------------------------------------
  const colors =
    useMemo(
      () =>
        modoActual ===
        "dark"
          ? darkColors
          : lightColors,
      [
        modoActual,
      ]
    );

  // -----------------------------------------
  // CAMBIAR TEMA
  // -----------------------------------------
  const cambiarTema =
    async (
      nuevoTema:
        ThemePreference
    ) => {
      const temaAnterior =
        preferencia;

      // Cambia visualmente
      // de inmediato.
      setPreferencia(
        nuevoTema
      );

      try {
        // Guardar solamente
        // si existe usuario autenticado.
        if (
          usuario?.uid
        ) {
          await guardarPreferenciaTema(
            usuario.uid,
            nuevoTema
          );
        }
      } catch (error) {
        // Si Firestore falla,
        // volvemos al tema anterior.
        setPreferencia(
          temaAnterior
        );

        console.error(
          "Error al guardar el tema:",
          error
        );

        throw error;
      }
    };

  return (
    <ThemeContext.Provider
      value={{
        preferencia,
        modoActual,
        colors,
        cargandoTema,
        cambiarTema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const contexto =
    useContext(
      ThemeContext
    );

  if (!contexto) {
    throw new Error(
      "useAppTheme debe utilizarse dentro de ThemeProvider."
    );
  }

  return contexto;
}