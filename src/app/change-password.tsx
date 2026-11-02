import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { firebaseAuth } from "../services/firebase";
import { mensajeErrorFirebase } from "../context/AuthContext";

type MensajeModal = {
  titulo: string;
  mensaje: string;
  tipo:
  | "exito"
  | "error"
  | "advertencia";
  alAceptar?: () => void;
};

export default function ChangePasswordScreen() {
  const keyboardFields = useRef<(TextInput | null)[]>([]);

  const {
    usuario,
    logout,
  } = useAuth();

  const [
    contrasenaActual,
    setContrasenaActual,
  ] = useState("");

  const [
    contrasenaNueva,
    setContrasenaNueva,
  ] = useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [
    mostrarContrasenas,
    setMostrarContrasenas,
  ] = useState(false);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    mensajeModal,
    setMensajeModal,
  ] =
    useState<MensajeModal | null>(
      null
    );

  // -----------------------------------------
  // MOSTRAR MENSAJE
  // -----------------------------------------
  const abrirMensajePersonalizado = (
    titulo: string,
    mensaje: string,
    tipo: MensajeModal["tipo"] =
      "advertencia",
    alAceptar?: () => void
  ) => {
    setMensajeModal({
      titulo,
      mensaje,
      tipo,
      alAceptar,
    });
  };

  // -----------------------------------------
  // ACEPTAR MENSAJE
  // -----------------------------------------
  const aceptarMensaje = () => {
    const accion =
      mensajeModal?.alAceptar;

    setMensajeModal(null);

    accion?.();
  };

  // -----------------------------------------
  // CAMBIAR CONTRASEÑA
  // -----------------------------------------
  const guardarCambios =
    async () => {
      if (!usuario) {
        abrirMensajePersonalizado(
          "Sesión no disponible",
          "No se encontró una sesión activa. Inicia sesión nuevamente.",
          "error"
        );

        return;
      }

      if (
        !contrasenaActual ||
        !contrasenaNueva ||
        !confirmarContrasena
      ) {
        abrirMensajePersonalizado(
          "Campos incompletos",
          "Completa todos los campos antes de continuar.",
          "advertencia"
        );

        return;
      }

      if (
        contrasenaNueva.length <
        6
      ) {
        abrirMensajePersonalizado(
          "Contraseña muy corta",
          "La nueva contraseña debe tener al menos 6 caracteres.",
          "advertencia"
        );

        return;
      }

      if (
        contrasenaNueva ===
        contrasenaActual
      ) {
        abrirMensajePersonalizado(
          "Contraseña sin cambios",
          "La nueva contraseña debe ser diferente de la contraseña actual.",
          "advertencia"
        );

        return;
      }

      if (
        contrasenaNueva !==
        confirmarContrasena
      ) {
        abrirMensajePersonalizado(
          "Las contraseñas no coinciden",
          "Verifica la nueva contraseña y su confirmación.",
          "advertencia"
        );

        return;
      }

      try {
        setGuardando(true);
        const fb = firebaseAuth.currentUser;
        if (!fb?.email) throw new Error("Inicia sesión nuevamente para continuar.");
        await reauthenticateWithCredential(
          fb,
          EmailAuthProvider.credential(fb.email, contrasenaActual)
        );
        await updatePassword(fb, contrasenaNueva);

        // Limpiar campos
        setContrasenaActual(
          ""
        );

        setContrasenaNueva(
          ""
        );

        setConfirmarContrasena(
          ""
        );

        abrirMensajePersonalizado(
          "¡Contraseña actualizada!",
          "Tu contraseña se cambió correctamente. Por seguridad, inicia sesión nuevamente.",
          "exito",
          async () => {
            await logout();

            router.replace(
              "/(auth)/login"
            );
          }
        );
      } catch (error) {
        console.error(
          "Error al cambiar contraseña:",
          error
        );

        abrirMensajePersonalizado(
          "No se pudo cambiar la contraseña",
          mensajeErrorFirebase(error),
          "error"
        );
      } finally {
        setGuardando(false);
      }
    };

  // -----------------------------------------
  // CONFIGURACIÓN DEL MODAL
  // -----------------------------------------
  const esExito =
    mensajeModal?.tipo ===
    "exito";

  const esError =
    mensajeModal?.tipo ===
    "error";

  const colorIcono =
    esExito
      ? "#238636"
      : esError
        ? "#D9534F"
        : colors.primary;

  const icono:
    | "checkmark-circle-outline"
    | "alert-circle-outline"
    | "information-circle-outline" =
    esExito
      ? "checkmark-circle-outline"
      : esError
        ? "alert-circle-outline"
        : "information-circle-outline";

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* VOLVER */}
        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.replace(
              "/profile"
            )
          }
        >
          <Ionicons
            name="arrow-back"
            size={21}
            color={
              colors.text
            }
          />

          <Text
            style={
              styles.backText
            }
          >
            Volver
          </Text>
        </Pressable>

        {/* ENCABEZADO */}
        <Text
          style={
            styles.title
          }
        >
          Cambiar contraseña
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Actualiza la contraseña
          de tu cuenta.
        </Text>

        {/* FORMULARIO */}
        <View
          style={
            styles.card
          }
        >
          {/* ACTUAL */}
          <Text
            style={
              styles.label
            }
          >
            Contraseña actual
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ingresa tu contraseña actual"
            placeholderTextColor={
              colors.textSecondary
            }
            value={
              contrasenaActual
            }
            onChangeText={
              setContrasenaActual
            }
            secureTextEntry={
              !mostrarContrasenas
            }
            autoCapitalize="none"
            autoCorrect={
              false
            }
          ref={(input) => { keyboardFields.current[0] = input; }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => keyboardFields.current[1]?.focus()}
          />

          {/* NUEVA */}
          <Text
            style={
              styles.label
            }
          >
            Nueva contraseña
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={
              colors.textSecondary
            }
            value={
              contrasenaNueva
            }
            onChangeText={
              setContrasenaNueva
            }
            secureTextEntry={
              !mostrarContrasenas
            }
            autoCapitalize="none"
            autoCorrect={
              false
            }
          ref={(input) => { keyboardFields.current[1] = input; }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => keyboardFields.current[2]?.focus()}
          />

          {/* CONFIRMAR */}
          <Text
            style={
              styles.label
            }
          >
            Confirmar nueva
            contraseña
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Repite la nueva contraseña"
            placeholderTextColor={
              colors.textSecondary
            }
            value={
              confirmarContrasena
            }
            onChangeText={
              setConfirmarContrasena
            }
            secureTextEntry={
              !mostrarContrasenas
            }
            autoCapitalize="none"
            autoCorrect={
              false
            }
          ref={(input) => { keyboardFields.current[2] = input; }}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          />

          {/* MOSTRAR / OCULTAR */}
          <Pressable
            style={
              styles.showPasswordButton
            }
            onPress={() =>
              setMostrarContrasenas(
                !mostrarContrasenas
              )
            }
          >
            <Ionicons
              name={
                mostrarContrasenas
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={19}
              color={
                colors.text
              }
            />

            <Text
              style={
                styles.showPasswordText
              }
            >
              {mostrarContrasenas
                ? "Ocultar contraseñas"
                : "Mostrar contraseñas"}
            </Text>
          </Pressable>

          {/* GUARDAR */}
          <Pressable
            style={[
              styles.button,
              guardando &&
              styles.buttonDisabled,
            ]}
            onPress={
              guardarCambios
            }
            disabled={
              guardando
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {guardando
                ? "Guardando..."
                : "Guardar cambios"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal
        visible={
          mensajeModal !==
          null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setMensajeModal(
            null
          )
        }
      >
        <View
          style={
            styles.confirmOverlay
          }
        >
          <View
            style={
              styles.confirmBox
            }
          >
            <View
              style={[
                styles.confirmIconContainer,
                {
                  backgroundColor:
                    esExito
                      ? "#E8F5E9"
                      : esError
                        ? "#FDECEA"
                        : colors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name={icono}
                size={30}
                color={
                  colorIcono
                }
              />
            </View>

            <Text
              style={
                styles.confirmTitle
              }
            >
              {
                mensajeModal?.titulo
              }
            </Text>

            <Text
              style={
                styles.confirmSubtitle
              }
            >
              {
                mensajeModal?.mensaje
              }
            </Text>

            <Pressable
              style={
                styles.confirmButton
              }
              onPress={
                aceptarMensaje
              }
            >
              <Text
                style={
                  styles.confirmButtonText
                }
              >
                Aceptar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      padding: 20,
      paddingBottom: 35,
    },

    backButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 6,
      marginBottom: 24,
      alignSelf:
        "flex-start",
    },

    backText: {
      color:
        colors.text,
      fontSize: 14,
    },

    title: {
      fontSize: 24,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    subtitle: {
      color:
        colors.textSecondary,
      fontSize: 14,
      marginTop: 6,
      marginBottom: 20,
    },

    card: {
      backgroundColor:
        colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding: 18,
    },

    label: {
      fontSize: 13,
      fontWeight:
        "600",
      color:
        colors.text,
      marginBottom: 6,
    },

    input: {
      borderWidth: 1,
      borderColor:
        colors.border,
      backgroundColor:
        colors.background,
      borderRadius: 8,
      paddingHorizontal:
        12,
      paddingVertical:
        11,
      color:
        colors.text,
      marginBottom: 16,
    },

    showPasswordButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      marginBottom: 18,
    },

    showPasswordText: {
      color:
        colors.text,
      fontSize: 13,
    },

    button: {
      backgroundColor:
        colors.primary,
      borderRadius: 10,
      alignItems:
        "center",
      padding: 14,
      marginTop: 4,
    },

    buttonDisabled: {
      opacity: 0.6,
    },

    buttonText: {
      color:
        colors.white,
      fontWeight:
        "700",
    },

    confirmOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0, 0, 0, 0.5)",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        24,
    },

    confirmBox: {
      width: "100%",
      maxWidth: 320,
      backgroundColor:
        colors.white,
      borderRadius: 20,
      padding: 24,
      alignItems:
        "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        0.15,
      shadowRadius: 12,
      elevation: 5,
    },

    confirmIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 20,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 16,
    },

    confirmTitle: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        colors.text,
      textAlign:
        "center",
      marginBottom: 8,
    },

    confirmSubtitle: {
      fontSize: 13,
      color:
        colors.textSecondary,
      textAlign:
        "center",
      lineHeight: 18,
      marginBottom: 22,
    },

    confirmButton: {
      width: "100%",
      backgroundColor:
        colors.primary,
      paddingVertical:
        13,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    confirmButtonText: {
      fontSize: 14,
      fontWeight:
        "700",
      color:
        colors.white,
    },
  });