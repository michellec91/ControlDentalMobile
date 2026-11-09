import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  // @ts-ignore: Tipos de Firebase para React Native
  getReactNativePersistence,
  initializeAuth,
  inMemoryPersistence,
} from "firebase/auth";
import { Platform } from "react-native";

// Usar el MISMO proyecto Firebase que utilizarán Google Auth y Firestore.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log("FIREBASE DEBUG", {
  apiKey: JSON.stringify(firebaseConfig.apiKey),
  apiKeyLength: firebaseConfig.apiKey?.length,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  throw new Error(
    "Configura las variables EXPO_PUBLIC_FIREBASE_* en .env (ver .env.example)."
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
console.log("Firebase cargado:", {
  proyecto: firebaseApp.options.projectId,
  claveLongitud: firebaseApp.options.apiKey?.length,
  claveFinal: firebaseApp.options.apiKey?.slice(-4),
});
// Persistencia real de Firebase Auth; no se guardan contraseñas en AsyncStorage.
export const firebaseAuth = (() => {
  try {
    const esServidorWeb =
      Platform.OS === "web" &&
      typeof window === "undefined";

    return initializeAuth(firebaseApp, {
      persistence: esServidorWeb
        ? inMemoryPersistence
        : Platform.OS === "web"
          ? browserLocalPersistence
          : getReactNativePersistence(AsyncStorage),
    });
  } catch (error: unknown) {
    // Fast Refresh puede ejecutar el módulo nuevamente cuando Auth ya existe.
    if ((error as { code?: string })?.code === "auth/already-initialized") {
      return getAuth(firebaseApp);
    }
    throw error;
  }
})();
