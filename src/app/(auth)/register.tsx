import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { API_URL } from "../../services/api";

export default function RegisterScreen() {
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
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    telefono,
    setTelefono,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    exito,
    setExito,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(false);

  // -----------------------------------------
  // REGISTRAR PACIENTE
  // -----------------------------------------
  const handleRegister =
    async () => {
      setError("");
      setExito("");

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

      if (
        !nombreLimpio ||
        !apellidoLimpio ||
        !correoLimpio ||
        !password.trim() ||
        !confirmPassword.trim() ||
        !telefonoLimpio
      ) {
        setError(
          "Por favor completa todos los campos obligatorios."
        );

        return;
      }

      // -------------------------------------
      // VALIDAR CORREO
      // -------------------------------------
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          correoLimpio
        )
      ) {
        setError(
          "Por favor ingresa un correo electrónico válido."
        );

        return;
      }

      // -------------------------------------
      // VALIDAR CONTRASEÑA
      // -------------------------------------
      if (
        password.length <
        6
      ) {
        setError(
          "La contraseña debe tener al menos 6 caracteres."
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Las contraseñas no coinciden. Por favor verifícalas."
        );

        return;
      }

      // -------------------------------------
      // VALIDAR TELÉFONO
      // -------------------------------------
      const telefonoRegex =
        /^[0-9+\s-]+$/;

      if (
        !telefonoRegex.test(
          telefonoLimpio
        )
      ) {
        setError(
          "El teléfono ingresado no es válido."
        );

        return;
      }

      try {
        setCargando(true);

        const response =
          await fetch(
            `${API_URL}/usuarios/register`,
            {
              method:
                "POST",

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

                  password,

                  telefono:
                    telefonoLimpio,
                }),
            }
          );

        const data =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.mensaje ||
              "No se pudo registrar el usuario."
          );
        }

        setExito(
          "¡Cuenta creada correctamente! Ahora puedes iniciar sesión."
        );

        setTimeout(
          () => {
            router.replace(
              "/(auth)/login"
            );
          },
          1200
        );
      } catch (error) {
        console.error(
          "Error al registrar usuario:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible crear la cuenta."
        );
      } finally {
        setCargando(false);
      }
    };

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
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require(
            "../../../assets/images/treatments.jpg"
          )}
          style={
            styles.heroImage
          }
          resizeMode="cover"
        />

        <View
          style={
            styles.header
          }
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            REGISTRO
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Creá tu cuenta
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Completá tus datos
            para empezar a
            solicitar tus citas
            dentales.
          </Text>
        </View>

        {error ? (
          <View
            style={
              styles.errorContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color="#D9534F"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : null}

        {exito ? (
          <View
            style={
              styles.successContainer
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#2E7D32"
            />

            <Text
              style={
                styles.successText
              }
            >
              {exito}
            </Text>
          </View>
        ) : null}

        <View
          style={
            styles.formContainer
          }
        >
          {/* NOMBRE */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Nombre
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={nombre}
                onChangeText={
                  setNombre
                }
                placeholder="Ingresá tu nombre"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
              />
            </View>
          </View>

          {/* APELLIDO */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Apellido
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={
                  apellido
                }
                onChangeText={
                  setApellido
                }
                placeholder="Ingresá tu apellido"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
              />
            </View>
          </View>

          {/* CORREO */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Correo electrónico
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={correo}
                onChangeText={
                  setCorreo
                }
                placeholder="Ingresá tu correo"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* CONTRASEÑA */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Contraseña
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={
                  password
                }
                onChangeText={
                  setPassword
                }
                placeholder="Ingresá tu contraseña"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
                secureTextEntry
              />
            </View>
          </View>

          {/* REPETIR CONTRASEÑA */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Repetir contraseña
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={
                  confirmPassword
                }
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Repetí tu contraseña"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
                secureTextEntry
              />
            </View>
          </View>

          {/* TELÉFONO */}
          <View
            style={
              styles.inputGroup
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Teléfono
            </Text>

            <View
              style={
                styles.searchContainer
              }
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={
                  colors.textSecondary
                }
              />

              <TextInput
                value={
                  telefono
                }
                onChangeText={
                  setTelefono
                }
                placeholder="Ingresá tu teléfono"
                placeholderTextColor={
                  colors.textSecondary
                }
                style={
                  styles.searchInput
                }
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* CREAR CUENTA */}
          <Pressable
            style={[
              styles.button,
              cargando &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleRegister
            }
            disabled={
              cargando
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              {cargando
                ? "Registrando..."
                : "Crear cuenta"}
            </Text>

            {!cargando && (
              <Ionicons
                name="checkmark"
                size={18}
                color={
                  colors.white
                }
              />
            )}
          </Pressable>

          {/* LOGIN */}
          <Pressable
            style={
              styles.linkContainer
            }
            onPress={() =>
              router.push(
                "/(auth)/login"
              )
            }
          >
            <Text
              style={
                styles.linkText
              }
            >
              ¿Ya tenés
              cuenta?{" "}
              <Text
                style={
                  styles.linkBold
                }
              >
                Iniciá sesión
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
      paddingHorizontal:
        20,
      paddingTop: 12,
      paddingBottom:
        40,
    },

    heroImage: {
      width: "100%",
      height: 140,
      borderRadius: 22,
      marginBottom: 20,
    },

    header: {
      marginBottom: 20,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight:
        "800",
      letterSpacing:
        1.2,
      color:
        colors.primary,
      marginBottom: 6,
    },

    title: {
      fontSize: 28,
      fontWeight:
        "800",
      color:
        colors.text,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.textSecondary,
      marginTop: 8,
    },

    formContainer: {
      gap: 14,
    },

    inputGroup: {
      gap: 6,
    },

    label: {
      fontSize: 13,
      fontWeight:
        "600",
      color:
        colors.text,
      marginLeft: 4,
    },

    searchContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 16,
      paddingHorizontal:
        14,
    },

    searchInput: {
      flex: 1,
      paddingVertical:
        14,
      marginLeft: 9,
      fontSize: 15,
      color:
        colors.text,
    },

    button: {
      marginTop: 10,
      backgroundColor:
        colors.primary,
      borderRadius: 14,
      paddingVertical:
        15,
      paddingHorizontal:
        16,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    buttonDisabled: {
      opacity: 0.7,
    },

    buttonText: {
      color:
        colors.white,
      fontSize: 15,
      fontWeight:
        "700",
    },

    linkContainer: {
      alignItems:
        "center",
      marginTop: 12,
    },

    linkText: {
      fontSize: 14,
      color:
        colors.textSecondary,
    },

    linkBold: {
      color:
        colors.primary,
      fontWeight:
        "700",
    },

    errorContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FDECEA",
      borderWidth: 1,
      borderColor:
        "#F5C6CB",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      gap: 8,
    },

    errorText: {
      color:
        "#D9534F",
      fontSize: 13,
      fontWeight:
        "600",
      flex: 1,
    },

    successContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#E8F5E9",
      borderWidth: 1,
      borderColor:
        "#A5D6A7",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      gap: 8,
    },

    successText: {
      color:
        "#2E7D32",
      fontSize: 13,
      fontWeight:
        "600",
      flex: 1,
    },
  });