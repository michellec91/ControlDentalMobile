import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";

import { useEffect } from "react";

import {
  ActivityIndicator,
  StyleSheet,
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
  } = useAuth();

  const router = useRouter();
  const segments =
    useSegments();

  useEffect(() => {
    if (cargandoSesion) {
      return;
    }

    const inAuthGroup =
      segments[0] ===
      "(auth)";

    // Sin sesión:
    // solo puede permanecer en login/registro.
    if (
      !usuario &&
      !inAuthGroup
    ) {
      router.replace(
        "/(auth)/login"
      );

      return;
    }

    // Con sesión:
    // no debe volver a login/registro.
    if (
      usuario &&
      inAuthGroup
    ) {
      router.replace(
        "/home"
      );
    }
  }, [
    usuario,
    cargandoSesion,
    segments,
    router,
  ]);

  // Esperar mientras AsyncStorage
  // recupera la sesión.
  if (cargandoSesion) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />
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
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles =
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        colors.background,
    },
  });