import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";

function RootLayoutNav() {
  const { usuario, cargandoSesion } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  
  useEffect(() => {
    if (cargandoSesion) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!usuario && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (usuario && inAuthGroup) {
      router.replace("/home");
    }
  }, [usuario, cargandoSesion, segments]);

  if (cargandoSesion) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
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