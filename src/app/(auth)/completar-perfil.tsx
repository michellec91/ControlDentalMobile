
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

import {
  mensajeErrorFirebase,
  useAuth,
} from "../../context/AuthContext";

export default function CompletarPerfilScreen() {
  const {
    usuario,
    completarRegistro,
    estadoRegistro,
    logout,
  } = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  // -----------------------------------------
  // CARGAR DATOS OBTENIDOS DE GOOGLE
  // -----------------------------------------
  useEffect(() => {
    if (!usuario) return;

    setNombre(
      usuario.nombre === "Paciente"
        ? ""
        : usuario.nombre || ""
    );

    setApellido(
      usuario.apellido === "Sin apellido"
        ? ""
        : usuario.apellido || ""
    );

    setTelefono(usuario.telefono || "");
  }, [
    usuario?.uid,
    usuario?.nombre,
    usuario?.apellido,
    usuario?.telefono,
  ]);

  // -----------------------------------------
  // COMPLETAR REGISTRO
  // -----------------------------------------
  const handleCompletarRegistro = async () => {
    setError("");

    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const telefonoLimpio = telefono.trim();

    // Validar campos vacíos
    if (
      !nombreLimpio ||
      !apellidoLimpio ||
      !telefonoLimpio
    ) {
      setError(
        "Por favor completa todos los campos obligatorios."
      );
      return;
    }

    // Validar longitud de los datos
    if (
      nombreLimpio.length > 100 ||
      apellidoLimpio.length > 100
    ) {
      setError(
        "El nombre y apellido no deben superar 100 caracteres."
      );
      return;
    }

    if (
      nombreLimpio.toLowerCase() === "paciente" ||
      apellidoLimpio.toLowerCase() === "sin apellido"
    ) {
      setError("Ingresá tu nombre y apellido reales.");
      return;
    }

    // Validar teléfono
    const telefonoRegex = /^[0-9+\s()-]+$/;

    if (
      telefonoLimpio.length > 50 ||
      !telefonoRegex.test(telefonoLimpio)
    ) {
      setError(
        "Ingresá un número de teléfono válido."
      );
      return;
    }

    try {
      setGuardando(true);

      // Enviar datos al backend mediante AuthContext
      await completarRegistro({
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        telefono: telefonoLimpio,
      });

      // No necesitamos router.replace("/home").
      // _layout.tsx redirigirá cuando
      // estadoRegistro cambie a "completo".

    } catch (error) {
      console.error(
        "Error al completar registro:",
        error
      );

      setError(mensajeErrorFirebase(error));

    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios" ? "padding" : "height"
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ENCABEZADO */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-circle-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text style={styles.eyebrow}>
              CONTROL DENTAL
            </Text>

            <Text style={styles.title}>
              Completar registro
            </Text>

            <Text style={styles.subtitle}>
              ¡Bienvenido! Antes de comenzar,
              necesitamos algunos datos adicionales
              para crear tu perfil de paciente.
            </Text>
          </View>

          {/* CORREO DE GOOGLE */}
          <View style={styles.correoContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.primary}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.correoLabel}>
                Cuenta vinculada
              </Text>

              <Text style={styles.correoText}>
                {usuario?.correo || "Cuenta de Google"}
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#2E7D32"
            />
          </View>

          {/* MENSAJE DE ERROR */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#D9534F"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {/* FORMULARIO */}
          <View style={styles.formContainer}>

            {/* NOMBRE */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nombre *
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Ingresá tu nombre"
                  placeholderTextColor={
                    colors.textSecondary
                  }
                  value={nombre}
                  onChangeText={setNombre}
                  maxLength={100}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* APELLIDO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Apellido *
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Ingresá tu apellido"
                  placeholderTextColor={
                    colors.textSecondary
                  }
                  value={apellido}
                  onChangeText={setApellido}
                  maxLength={100}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* TELÉFONO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Teléfono *
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Ejemplo: 7777-7777"
                  placeholderTextColor={
                    colors.textSecondary
                  }
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  maxLength={50}
                />
              </View>
            </View>

            {/* INFORMACIÓN */}
            <View style={styles.infoContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />

              <Text style={styles.infoText}>
                Tu correo electrónico ya fue obtenido
                de Firebase. Solo necesitamos completar
                la información de tu perfil.
              </Text>
            </View>

            {/* GUARDAR */}
            <Pressable
              style={[
                styles.button,
                guardando && styles.buttonDisabled,
              ]}
              onPress={handleCompletarRegistro}
              disabled={
                guardando ||
                estadoRegistro === "verificando"
              }
            >
              {guardando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Completar registro
                  </Text>

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={21}
                    color={colors.white}
                  />
                </>
              )}
            </Pressable>

            {/* CERRAR SESIÓN */}
            <Pressable
              style={styles.logoutContainer}
              onPress={() => void logout()}
              disabled={guardando}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.textSecondary}
              />

              <Text style={styles.logoutText}>
                Cerrar sesión
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------------------------
// ESTILOS
// -----------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    flexGrow: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  iconContainer: {
    width: 82,
    height: 82,
    backgroundColor: colors.surface,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 8,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },

  correoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 24,
  },

  correoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },

  correoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  formContainer: {
    gap: 18,
  },

  inputGroup: {
    gap: 7,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginLeft: 4,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    paddingVertical: 15,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },

  infoContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEA",
    borderWidth: 1,
    borderColor: "#F5C6CB",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#D9534F",
    fontWeight: "600",
  },

  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 17,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    paddingVertical: 10,
  },

  logoutText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
