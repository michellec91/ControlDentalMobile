import {
  Redirect,
} from "expo-router";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const {
    usuario,
    cargandoSesion,
  } = useAuth();

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

  if (usuario) {
    return (
      <Redirect
        href="/home"
      />
    );
  }

  return (
    <Redirect
      href="/(auth)/login"
    />
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