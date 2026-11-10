import {
  Stack,
  useRouter,
  useSegments,
  usePathname,
} from "expo-router";

import { useEffect } from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "../constants/theme";

import {
  AuthProvider,
  useAuth,
} from "../context/AuthContext";

function RootLayoutNav() {
  const {
    usuario,
    cargandoSesion,
    estadoRegistro,
    errorRegistro,
    verificarRegistro,
    logout,
  } = useAuth();

  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  const inAuthGroup = segments[0] === "(auth)";

  const enCompletarPerfil =
    pathname === "/completar-perfil";

  useEffect(() => {
    if (
      cargandoSesion ||
      estadoRegistro === "verificando" ||
      estadoRegistro === "error"
    ) {
      return;
    }

    // SIN SESIÓN
    if (!usuario || estadoRegistro === "sin_sesion") {
      if (!inAuthGroup || enCompletarPerfil) {
        router.replace("/(auth)/login");
      }
      return;
    }

    // USUARIO CON REGISTRO INCOMPLETO
    if (estadoRegistro === "pendiente") {
      if (!enCompletarPerfil) {
        router.replace("../(auth)/completar-perfil");
      }
      return;
    }

    // USUARIO CON REGISTRO COMPLETO
    if (estadoRegistro === "completo" && inAuthGroup) {
      router.replace("/home");
    }

  }, [
    usuario,
    cargandoSesion,
    estadoRegistro,
    inAuthGroup,
    enCompletarPerfil,
    router,
  ]);

  // ESPERAR VERIFICACIÓN
  if (
    cargandoSesion ||
    estadoRegistro === "verificando" ||
    (estadoRegistro === "pendiente" && !enCompletarPerfil) ||
    (estadoRegistro === "completo" && inAuthGroup) ||
    (!usuario && (!inAuthGroup || enCompletarPerfil))
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  // ERROR AL CONECTAR CON EL BACKEND
  if (estadoRegistro === "error") {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>
          No se pudo verificar tu registro
        </Text>

        <Text style={styles.errorText}>
          {errorRegistro ||
            "Verificá la conexión con el servidor."}
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => void verificarRegistro()}
        >
          <Text style={styles.buttonText}>
            Reintentar
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void logout()}
        >
          <Text style={styles.linkText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={Platform.OS === "web" ? styles.webFrame : undefined}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webFrame: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    marginHorizontal: "auto",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },

  errorText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 18,
  },

  buttonText: {
    color: colors.white,
    fontWeight: "700",
  },

  linkText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
