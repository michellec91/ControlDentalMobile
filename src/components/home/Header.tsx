import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../context/ThemeContext";
import SideMenu from "./SideMenu";

type HeaderProps = {
  showBack?: boolean;
};

export default function Header({ showBack = true }: HeaderProps) {
  const router = useRouter();

  const { colors, modoActual } = useAppTheme();
  const styles = createStyles(colors, modoActual);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <>
      <View style={styles.headerContainer}>
        {/* IZQUIERDA: Botón de Volver (azul redondeado) */}
        {showBack ? (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}

        {/* DERECHA: Botón de Inicio (con el ícono solicitado) + Menú Hamburguesa */}
        <View style={styles.rightGroup}>
          <Pressable
            style={styles.homeButton}
            onPress={() => router.push("/home")}
          >
            <Ionicons name="home" size={22} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.menuBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons name="menu" size={24} color={modoActual === "dark" ? "#E2E8F0" : "#0F172A"} />
          </Pressable>
        </View>
      </View>

      {/* Menú desplegable lateral */}
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
}

const createStyles = (
  colors: any,
  modoActual: "light" | "dark"
) =>
  StyleSheet.create({
  headerContainer: {
    width: "100%",
    maxWidth: 430,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: modoActual === "dark" ? "#1E293B" : colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: modoActual === "dark" ? "#334155" : colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
});
