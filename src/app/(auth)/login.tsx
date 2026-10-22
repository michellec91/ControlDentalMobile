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
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";

export default function LoginScreen() {
  const { login } = useAuth();

  const [correo, setCorreo] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [exito, setExito] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  // -----------------------------------------
  // INICIAR SESIÓN
  // -----------------------------------------
  const handleLogin = async () => {
    setError("");
    setExito("");

    const correoLimpio =
      correo.trim().toLowerCase();

    if (
      !correoLimpio ||
      !password.trim()
    ) {
      setError(
        "Por favor completa todos los campos."
      );
      return;
    }

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

    if (
      password.length < 6
    ) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    try {
      setCargando(true);

      const response =
        await fetch(
          `${API_URL}/usuarios/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                correo:
                  correoLimpio,
                password,
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
            "Credenciales incorrectas."
        );
      }

      if (!data.usuario) {
        throw new Error(
          "El servidor no devolvió los datos del usuario."
        );
      }

      // -------------------------------------
      // SOLO PACIENTES EN LA APP MÓVIL
      // -------------------------------------
      const rol =
        data.usuario.rol
          ?.toLowerCase();

      if (
        rol !==
        "paciente"
      ) {
        throw new Error(
          "Esta aplicación está disponible únicamente para pacientes."
        );
      }

      const estado =
        data.usuario.estado
          ?.toLowerCase();

      if (
        estado &&
        estado !==
          "activo"
      ) {
        throw new Error(
          "Tu cuenta se encuentra inactiva."
        );
      }

      // -------------------------------------
      // GUARDAR SESIÓN
      // -------------------------------------
      await login(
        data.usuario
      );

      setExito(
        `¡Bienvenido/a, ${data.usuario.nombre}!`
      );

      setTimeout(
        () => {
          router.replace(
            "/home"
          );
        },
        900
      );
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión."
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
            CONTROL DENTAL
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Iniciar sesión
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Ingresá tus
            credenciales para
            acceder a tus citas
            y tratamientos.
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

          {/* BOTÓN */}
          <Pressable
            style={[
              styles.button,
              cargando &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleLogin
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
                ? "Iniciando sesión..."
                : "Entrar"}
            </Text>

            {!cargando && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  colors.white
                }
              />
            )}
          </Pressable>

          {/* REGISTRO */}
          <Pressable
            style={
              styles.linkContainer
            }
            onPress={() =>
              router.push(
                "/(auth)/register"
              )
            }
          >
            <Text
              style={
                styles.linkText
              }
            >
              ¿No tenés
              cuenta?{" "}
              <Text
                style={
                  styles.linkBold
                }
              >
                Registrate
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
      height: 165,
      borderRadius: 22,
      marginBottom: 22,
    },

    header: {
      marginBottom: 24,
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
      gap: 16,
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