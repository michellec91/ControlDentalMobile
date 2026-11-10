import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../../context/ThemeContext";

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const { logout } = useAuth();
  const { colors, modoActual } = useAppTheme();

  const styles = createStyles(colors, modoActual);

  const router = useRouter();

  const [modalLogoutVisible, setLogoutVisible] = useState(false);

  // -----------------------------------------
  // NAVEGAR
  // -----------------------------------------
  const navigateTo = (route: string) => {
    onClose();

    router.push(route as never);
  };

  // -----------------------------------------
  // ABRIR MODAL DE CIERRE
  // -----------------------------------------
  const handleLogout = () => {
    onClose();

    setLogoutVisible(true);
  };

  // -----------------------------------------
  // CONFIRMAR CIERRE DE SESIÓN
  // -----------------------------------------
  const confirmLogout = async () => {
    try {
      setLogoutVisible(false);

      await logout();

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* MENÚ LATERAL */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* FONDO OSCURO */}
          <Pressable style={styles.overlay} onPress={onClose} />

          {/* PANEL */}
          <View style={styles.drawer}>
            {/* ENCABEZADO */}
            <View style={styles.top}>
              <View style={styles.brandContainer}>
                <View style={styles.logo}>
                  <Ionicons
                    name="medical-outline"
                    size={26}
                    color={colors.white}
                  />
                </View>

                <View>
                  <Text style={styles.title}>Control Dental</Text>

                  <Text style={styles.subtitle}>Clínica Dental Sonrisas</Text>
                </View>
              </View>

              <Pressable style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* OPCIONES */}
            <View style={styles.menu}>
              {/* TRATAMIENTOS */}
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo("/treatments")}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="medical-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.menuText}>Tratamientos</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </Pressable>

              {/* SOLICITAR CITA */}
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo("/appointment/create")}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.menuText}>Solicitar cita</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </Pressable>

              {/* MIS CITAS */}
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo("/appointments")}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.menuText}>Mis citas</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </Pressable>

              {/* HISTORIAL MÉDICO */}
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo("/history")}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.menuText}>Historial médico</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </Pressable>

              {/* PERFIL */}
              <Pressable
                style={styles.menuItem}
                onPress={() => navigateTo("/profile")}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.menuText}>Mi perfil</Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* CERRAR SESIÓN */}
            <View style={styles.logoutContainer}>
              <Pressable style={styles.logoutItem} onPress={handleLogout}>
                <View style={styles.logoutIcon}>
                  <Ionicons name="log-out-outline" size={22} color="#D9534F" />
                </View>

                <Text style={styles.logoutText}>Cerrar sesión</Text>
              </Pressable>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Cuidamos tu sonrisa</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        visible={modalLogoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconContainer}>
              <Ionicons name="log-out-outline" size={30} color="#D9534F" />
            </View>

            <Text style={styles.confirmTitle}>¿Querés cerrar sesión?</Text>

            <Text style={styles.confirmSubtitle}>
              Tendrás que ingresar tus credenciales nuevamente para acceder.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <Pressable
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelBtnText}>No</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, styles.acceptBtn]}
                onPress={confirmLogout}
              >
                <Text style={styles.acceptBtnText}>Sí, salir</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any, modoActual: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    overlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: "rgba(20, 35, 30, 0.38)",
    },

    drawer: {
      width: "84%",
      height: "100%",
      backgroundColor: colors.white,
      paddingTop: 60,
      paddingHorizontal: 22,
    },

    webDrawer: {
      maxWidth: 470,
      alignSelf: "flex-start",
    },

    top: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    brandContainer: {
      flexDirection: "row",
      alignItems: "center",
    },

    logo: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    title: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.text,
    },

    subtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 3,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    menu: {
      marginTop: 22,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 5,
    },

    menuIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    menuText: {
      flex: 1,
      marginLeft: 14,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    logoutContainer: {
      marginTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 15,
    },

    logoutItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },

    logoutIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: "#FDECEA",
      alignItems: "center",
      justifyContent: "center",
    },

    logoutText: {
      flex: 1,
      marginLeft: 14,
      fontSize: 15,
      fontWeight: "600",
      color: "#D9534F",
    },

    footer: {
      marginTop: "auto",
      marginBottom: 35,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },

    footerText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },

    confirmOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    confirmBox: {
      width: "100%",
      maxWidth: 320,
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },

    confirmIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 20,
      backgroundColor: "#FDECEA",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },

    confirmTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
      marginBottom: 8,
    },

    confirmSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
      marginBottom: 22,
    },

    confirmButtonsRow: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },

    confirmBtn: {
      flex: 1,
      paddingVertical: 13,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelBtn: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },

    cancelBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },

    acceptBtn: {
      backgroundColor: "#D9534F",
    },

    acceptBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.white,
    },
  });
