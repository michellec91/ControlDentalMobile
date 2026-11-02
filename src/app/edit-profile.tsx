import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

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
import { API_URL } from "../services/api";

type MensajeModal = {
  titulo: string;
  mensaje: string;
  tipo:
    | "exito"
    | "error"
    | "advertencia";
  alAceptar?: () => void;
};

export default function EditProfileScreen() {
  const keyboardFields = useRef<(TextInput | null)[]>([]);

  const {
    usuario,
    actualizarUsuario,
  } = useAuth();

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    apellido,
    setApellido,
  ] = useState("");

  const [
    correo,
    setCorreo,
  ] = useState("");

  const [
    telefono,
    setTelefono,
  ] = useState("");

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
  // CARGAR DATOS DEL USUARIO
  // -----------------------------------------
  useEffect(() => {
    if (!usuario) {
      return;
    }

    setNombre(
      usuario.nombre || ""
    );

    setApellido(
      usuario.apellido || ""
    );

    setCorreo(
      usuario.correo || ""
    );

    setTelefono(
      usuario.telefono || ""
    );
  }, [usuario]);

  // -----------------------------------------
  // VOLVER AL PERFIL
  // -----------------------------------------
  const volverPerfil = () => {
    router.replace(
      "/profile"
    );
  };

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
  // GUARDAR CAMBIOS
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

      const nombreLimpio =
        nombre.trim();

      const apellidoLimpio =
        apellido.trim();

      const correoLimpio =
        correo
          .trim()
          .toLowerCase();

      const telefonoLimpio =
        telefono.trim();

      // -------------------------------------
      // CAMPOS OBLIGATORIOS
      // -------------------------------------
      if (
        !nombreLimpio ||
        !apellidoLimpio ||
        !correoLimpio ||
        !telefonoLimpio
      ) {
        abrirMensajePersonalizado(
          "Campos incompletos",
          "Completa todos los campos antes de continuar.",
          "advertencia"
        );

        return;
      }

      // -------------------------------------
      // NOMBRE Y APELLIDO
      // -------------------------------------
      const patronNombre =
        /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

      if (
        !patronNombre.test(
          nombreLimpio
        )
      ) {
        abrirMensajePersonalizado(
          "Nombre inválido",
          "El nombre solo puede contener letras y espacios.",
          "advertencia"
        );

        return;
      }

      if (
        !patronNombre.test(
          apellidoLimpio
        )
      ) {
        abrirMensajePersonalizado(
          "Apellido inválido",
          "El apellido solo puede contener letras y espacios.",
          "advertencia"
        );

        return;
      }

      // -------------------------------------
      // CORREO
      // -------------------------------------
      const patronCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !patronCorreo.test(
          correoLimpio
        )
      ) {
        abrirMensajePersonalizado(
          "Correo inválido",
          "Ingresa un correo electrónico válido.",
          "advertencia"
        );

        return;
      }

      // -------------------------------------
      // TELÉFONO
      // -------------------------------------
      const patronTelefono =
        /^[0-9+\s-]{8,20}$/;

      if (
        !patronTelefono.test(
          telefonoLimpio
        )
      ) {
        abrirMensajePersonalizado(
          "Teléfono inválido",
          "Ingresa un número de teléfono válido.",
          "advertencia"
        );

        return;
      }

      // -------------------------------------
      // VERIFICAR SI HUBO CAMBIOS
      // -------------------------------------
      const datosSinCambios =
        nombreLimpio ===
          usuario.nombre.trim() &&
        apellidoLimpio ===
          (
            usuario.apellido ||
            ""
          ).trim() &&
        correoLimpio ===
          usuario.correo
            .trim()
            .toLowerCase() &&
        telefonoLimpio ===
          (
            usuario.telefono ||
            ""
          ).trim();

      if (
        datosSinCambios
      ) {
        abrirMensajePersonalizado(
          "No hay cambios",
          "No modificaste ningún dato de tu perfil.",
          "advertencia"
        );

        return;
      }

      // -------------------------------------
      // ID DEL USUARIO
      // -------------------------------------
      const idUsuario =
        usuario.id_usuario;

      if (!idUsuario) {
        abrirMensajePersonalizado(
          "Error",
          "No se encontró el ID del usuario. Cierra sesión e inicia sesión nuevamente.",
          "error"
        );

        return;
      }

      try {
        setGuardando(true);

        // -------------------------------------
        // ACTUALIZAR EN EL BACKEND
        // -------------------------------------
        const respuesta =
          await fetch(
            `${API_URL}/usuarios/${idUsuario}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  nombre:
                    nombreLimpio,

                  apellido:
                    apellidoLimpio,

                  correo:
                    correoLimpio,

                  telefono:
                    telefonoLimpio,
                }),
            }
          );

        const datos =
          await respuesta
            .json()
            .catch(
              () => ({})
            );

        if (
          !respuesta.ok
        ) {
          throw new Error(
            datos.error ||
              datos.mensaje ||
              "No se pudo actualizar el perfil."
          );
        }

        // -------------------------------------
        // ACTUALIZAR LA SESIÓN LOCAL
        // -------------------------------------
        await actualizarUsuario({
          nombre:
            datos.usuario?.nombre ??
            nombreLimpio,

          apellido:
            datos.usuario?.apellido ??
            apellidoLimpio,

          correo:
            datos.usuario?.correo ??
            correoLimpio,

          telefono:
            datos.usuario?.telefono ??
            telefonoLimpio,
        });

        abrirMensajePersonalizado(
          "¡Perfil actualizado!",
          "Tus datos se guardaron correctamente.",
          "exito",
          volverPerfil
        );
      } catch (error) {
        console.error(
          "Error al actualizar perfil:",
          error
        );

        abrirMensajePersonalizado(
          "No se pudo actualizar",
          error instanceof Error
            ? error.message
            : "Ocurrió un error al guardar los cambios.",
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
          onPress={
            volverPerfil
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
          Editar perfil
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Actualiza tu información
          personal.
        </Text>

        {/* FORMULARIO */}
        <View
          style={
            styles.card
          }
        >
          {/* NOMBRE */}
          <Text
            style={
              styles.label
            }
          >
            Nombre
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ingresa tu nombre"
            placeholderTextColor={
              colors.textSecondary
            }
            value={nombre}
            onChangeText={
              setNombre
            }
            autoCapitalize="words"
          ref={(input) => { keyboardFields.current[0] = input; }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => keyboardFields.current[1]?.focus()}
          />

          {/* APELLIDO */}
          <Text
            style={
              styles.label
            }
          >
            Apellido
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ingresa tu apellido"
            placeholderTextColor={
              colors.textSecondary
            }
            value={
              apellido
            }
            onChangeText={
              setApellido
            }
            autoCapitalize="words"
          ref={(input) => { keyboardFields.current[1] = input; }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => keyboardFields.current[2]?.focus()}
          />

          {/* CORREO */}
          <Text
            style={
              styles.label
            }
          >
            Correo electrónico
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="correo@ejemplo.com"
            placeholderTextColor={
              colors.textSecondary
            }
            value={correo}
            onChangeText={
              setCorreo
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={
              false
            }
          ref={(input) => { keyboardFields.current[2] = input; }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => keyboardFields.current[3]?.focus()}
          />

          {/* TELÉFONO */}
          <Text
            style={
              styles.label
            }
          >
            Teléfono
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ej. 77036701"
            placeholderTextColor={
              colors.textSecondary
            }
            value={
              telefono
            }
            onChangeText={
              setTelefono
            }
            keyboardType="phone-pad"
          ref={(input) => { keyboardFields.current[3] = input; }}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          />

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