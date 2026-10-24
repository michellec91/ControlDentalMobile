
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/api";

export default function ProfileScreen() {
  const { usuario, logout, actualizarUsuario } = useAuth();

  const [modalLogoutVisible, setModalLogoutVisible] =
    useState(false);

  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Muestra mensajes tanto en web como en dispositivos móviles.
  const mostrarMensaje = (titulo: string, mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // -----------------------------------------
  // DATOS DEL USUARIO
  // -----------------------------------------
  const nombreCompleto =
    [usuario?.nombre, usuario?.apellido]
      .filter(Boolean)
      .join(" ")
      .trim() || "Usuario";

  const correo = usuario?.correo || "No disponible";
  const telefono = usuario?.telefono || "No disponible";

  const imagenPerfil = usuario?.imagen_perfil || null;

  const fotoPerfil =
    typeof imagenPerfil === "string" && imagenPerfil.length > 0
      ? imagenPerfil
      : null;

  // -----------------------------------------
  // SELECCIONAR Y SUBIR FOTO DE PERFIL
  // -----------------------------------------
  const seleccionarFotoPerfil = async () => {
    if (subiendoFoto) return;

    try {
      if (!usuario?.id_usuario) {
        mostrarMensaje(
          "Error",
          "No se encontró el usuario de la sesión."
        );
        return;
      }

      // Solicita permiso para acceder a las fotos del dispositivo.
      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        mostrarMensaje(
          "Permiso necesario",
          "Permite el acceso a tus fotos para cambiar tu imagen de perfil."
        );
        return;
      }

      // Permite elegir y recortar una foto cuadrada.
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (resultado.canceled || !resultado.assets?.[0]) {
        return;
      }

      const imagen = resultado.assets[0];

      if (!imagen.base64) {
        throw new Error(
          "No se pudo leer la imagen seleccionada."
        );
      }

      setSubiendoFoto(true);

      // Convierte la imagen a un formato que acepta el endpoint actual.
      const tipoImagen = imagen.mimeType || "image/jpeg";
      const imagenBase64 =
        `data:${tipoImagen};base64,${imagen.base64}`;

      // Envía la imagen al backend conectado con control_dental.
      const respuesta = await fetch(
        `${API_URL}/usuarios/${usuario.id_usuario}/imagen-perfil`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imagen_perfil: imagenBase64,
          }),
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          data.error || "No se pudo guardar la foto de perfil."
        );
      }

      // Actualiza el estado de la aplicación y la sesión guardada.
      await actualizarUsuario({
        imagen_perfil: data.imagen_perfil || imagenBase64,
      });

      mostrarMensaje(
        "Foto actualizada",
        "Tu foto de perfil se guardó correctamente."
      );
    } catch (error) {
      console.error(
        "Error al actualizar la foto de perfil:",
        error
      );

      mostrarMensaje(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la foto de perfil."
      );
    } finally {
      setSubiendoFoto(false);
    }
  };

  // -----------------------------------------
  // VOLVER AL INICIO
  // -----------------------------------------
  const volverInicio = () => {
    router.replace("/home");
  };

  // -----------------------------------------
  // CERRAR SESIÓN
  // -----------------------------------------
  const cerrarSesion = () => {
    setModalLogoutVisible(true);
  };

  const confirmarCierreSesion = async () => {
    try {
      setModalLogoutVisible(false);

      await logout();

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);

      mostrarMensaje(
        "Error",
        "No se pudo cerrar la sesión. Inténtalo nuevamente."
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BARRA SUPERIOR */}
        <View style={styles.topBar}>
          <Pressable
            onPress={volverInicio}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={colors.text}
            />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          <Text style={styles.pageTitle}>
            Perfil del usuario
          </Text>
        </View>

        {/* FOTO DE PERFIL */}
        <View style={styles.avatar}>
          <Pressable
            style={styles.avatarButton}
            onPress={seleccionarFotoPerfil}
            disabled={subiendoFoto}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
          >
            {subiendoFoto ? (
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            ) : fotoPerfil ? (
              <Image
                source={{ uri: fotoPerfil }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={86}
                color={colors.primary}
              />
            )}

            {!subiendoFoto && (
              <View style={styles.cameraIcon}>
                <Ionicons
                  name="camera"
                  size={17}
                  color={colors.white}
                />
              </View>
            )}
          </Pressable>

          <Text style={styles.changePhotoText}>
            {subiendoFoto
              ? "Subiendo foto..."
              : "Toca la foto para cambiarla"}
          </Text>
        </View>

        {/* INFORMACIÓN PERSONAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Información personal
          </Text>

          <Text style={styles.label}>
            Nombre completo
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {nombreCompleto}
            </Text>
          </View>

          <Text style={styles.label}>
            Correo electrónico
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {correo}
            </Text>
          </View>

          <Text style={styles.label}>
            Teléfono
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {telefono}
            </Text>
          </View>

          <Pressable
            style={styles.outlineButton}
            onPress={() => router.push("/edit-profile")}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.text}
            />
            <Text style={styles.outlineButtonText}>
              Editar perfil
            </Text>
          </Pressable>
        </View>

        {/* SEGURIDAD */}
        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={colors.text}
            />
            <Text style={styles.cardTitle}>
              Seguridad
            </Text>
          </View>

          <Text style={styles.label}>
            Contraseña
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ••••••••••
            </Text>
          </View>

          <Pressable
            style={styles.outlineButton}
            onPress={() => router.push("/change-password")}
          >
            <Ionicons
              name="key-outline"
              size={18}
              color={colors.text}
            />
            <Text style={styles.outlineButtonText}>
              Cambiar contraseña
            </Text>
          </Pressable>
        </View>

        {/* CERRAR SESIÓN */}
        <Pressable
          style={styles.logoutButton}
          onPress={cerrarSesion}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color={colors.white}
          />
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      <Modal
        visible={modalLogoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalLogoutVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconContainer}>
              <Ionicons
                name="log-out-outline"
                size={30}
                color="#D9534F"
              />
            </View>

            <Text style={styles.confirmTitle}>
              ¿Querés cerrar sesión?
            </Text>

            <Text style={styles.confirmSubtitle}>
              Tendrás que ingresar tus credenciales nuevamente
              para acceder.
            </Text>

            <View style={styles.confirmButtonsRow}>
              <Pressable
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setModalLogoutVisible(false)}
              >
                <Text style={styles.cancelBtnText}>
                  No
                </Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, styles.acceptBtn]}
                onPress={confirmarCierreSesion}
              >
                <Text style={styles.acceptBtnText}>
                  Sí, salir
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 35,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  backText: {
    color: colors.text,
    fontSize: 14,
  },

  pageTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  avatar: {
    alignItems: "center",
    marginBottom: 18,
  },

  avatarButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  cameraIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },

  changePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },

  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },

  infoBox: {
    minHeight: 42,
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 7,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: colors.text,
  },

  outlineButton: {
    minHeight: 40,
    width: 200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingHorizontal: 13,
    marginTop: 3,
  },

  outlineButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },

  logoutButton: {
    alignSelf: "center",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingHorizontal: 18,
  },

  logoutText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
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
