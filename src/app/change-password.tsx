
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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

// Tipos de mensajes que puede mostrar la ventana personalizada.
type MensajeModal = {
    titulo: string;
    mensaje: string;
    tipo: "exito" | "error" | "advertencia";
    alAceptar?: () => void;
};

export default function ChangePasswordScreen() {
    // Obtener el usuario actual y la función para cerrar su sesión.
    const { usuario, logout } = useAuth();

    // Guardar los valores de las contraseñas y el estado del formulario.
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mostrarContrasenas, setMostrarContrasenas] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Controlar la ventana de mensajes personalizados.
    const [mensajeModal, setMensajeModal] =
        useState<MensajeModal | null>(null);

    // Mostrar un mensaje con el diseño de la aplicación.
    const abrirMensajePersonalizado = (
        titulo: string,
        mensaje: string,
        tipo: MensajeModal["tipo"] = "advertencia",
        alAceptar?: () => void
    ) => {
        setMensajeModal({
            titulo,
            mensaje,
            tipo,
            alAceptar,
        });
    };

    // Cerrar el modal y ejecutar la acción asociada, si existe.
    const aceptarMensaje = () => {
        const accion = mensajeModal?.alAceptar;
        setMensajeModal(null);
        accion?.();
    };

    // Validar las contraseñas y enviarlas al backend.
    const guardarCambios = async () => {
        // Comprobar que todos los campos estén completos.
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

        // Exigir al menos 8 caracteres en la nueva contraseña.
        if (contrasenaNueva.length < 8) {
            abrirMensajePersonalizado(
                "Contraseña muy corta",
                "La nueva contraseña debe tener al menos 8 caracteres.",
                "advertencia"
            );
            return;
        }

        // Evitar que la nueva contraseña sea igual a la actual.
        if (contrasenaNueva === contrasenaActual) {
            abrirMensajePersonalizado(
                "Contraseña sin cambios",
                "La nueva contraseña debe ser diferente de la contraseña actual.",
                "advertencia"
            );
            return;
        }

        // Comprobar que la confirmación coincida con la nueva contraseña.
        if (contrasenaNueva !== confirmarContrasena) {
            abrirMensajePersonalizado(
                "Las contraseñas no coinciden",
                "Verifica la nueva contraseña y su confirmación.",
                "advertencia"
            );
            return;
        }

        // Obtener el identificador del usuario de la sesión.
        const idUsuario = usuario?.id_usuario ?? usuario?.id_user;

        if (!idUsuario) {
            abrirMensajePersonalizado(
                "Error",
                "No se encontró el ID del usuario. Cierra sesión e inicia sesión nuevamente.",
                "error"
            );
            return;
        }

        try {
            // Indicar que se está procesando la solicitud.
            setGuardando(true);

            // Enviar las contraseñas al backend.
            const respuesta = await fetch(
                `${API_URL}/usuarios/${idUsuario}/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contrasenaActual,
                        contrasenaNueva,
                    }),
                }
            );

            // Leer la respuesta del servidor.
            const datos = await respuesta.json();

            // Mostrar el error que devuelve el backend si falla.
            if (!respuesta.ok) {
                throw new Error(
                    datos.error ||
                        datos.mensaje ||
                        "No se pudo cambiar la contraseña."
                );
            }

            // Limpiar los campos después de cambiar la contraseña.
            setContrasenaActual("");
            setContrasenaNueva("");
            setConfirmarContrasena("");

            // Confirmar el cambio y cerrar sesión al aceptar.
            abrirMensajePersonalizado(
                "¡Contraseña actualizada!",
                "Tu contraseña se cambió correctamente. Presiona Aceptar para volver al inicio de sesión.",
                "exito",
                async () => {
                    // Eliminar la sesión guardada.
                    await logout();

                    // Regresar al inicio de sesión.
                    router.replace("/(auth)/login");
                }
            );
        } catch (error) {
            // Informar si ocurrió un problema de conexión o del servidor.
            const mensaje =
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al cambiar la contraseña.";

            abrirMensajePersonalizado(
                "No se pudo cambiar la contraseña",
                mensaje,
                "error"
            );
        } finally {
            // Habilitar nuevamente el botón.
            setGuardando(false);
        }
    };

    // Elegir el icono y el color según el tipo de mensaje.
    const esExito = mensajeModal?.tipo === "exito";
    const esError = mensajeModal?.tipo === "error";

    const colorIcono = esExito
        ? "#238636"
        : esError
          ? "#D9534F"
          : colors.primary;

    const icono = esExito
        ? "checkmark-circle-outline"
        : esError
          ? "alert-circle-outline"
          : "information-circle-outline";

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Regresar al perfil sin guardar cambios. */}
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.replace("/profile")}
                >
                    <Ionicons
                        name="arrow-back"
                        size={21}
                        color={colors.text}
                    />
                    <Text style={styles.backText}>Volver</Text>
                </Pressable>

                {/* Título y descripción de la pantalla. */}
                <Text style={styles.title}>Cambiar contraseña</Text>
                <Text style={styles.subtitle}>
                    Actualiza la contraseña de tu cuenta.
                </Text>

                {/* Formulario de cambio de contraseña. */}
                <View style={styles.card}>
                    <Text style={styles.label}>Contraseña actual</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu contraseña actual"
                        placeholderTextColor={colors.textSecondary}
                        value={contrasenaActual}
                        onChangeText={setContrasenaActual}
                        secureTextEntry={!mostrarContrasenas}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Nueva contraseña</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Mínimo 8 caracteres"
                        placeholderTextColor={colors.textSecondary}
                        value={contrasenaNueva}
                        onChangeText={setContrasenaNueva}
                        secureTextEntry={!mostrarContrasenas}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>
                        Confirmar nueva contraseña
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Repite la nueva contraseña"
                        placeholderTextColor={colors.textSecondary}
                        value={confirmarContrasena}
                        onChangeText={setConfirmarContrasena}
                        secureTextEntry={!mostrarContrasenas}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Permitir mostrar u ocultar las tres contraseñas. */}
                    <Pressable
                        style={styles.showPasswordButton}
                        onPress={() =>
                            setMostrarContrasenas(!mostrarContrasenas)
                        }
                    >
                        <Ionicons
                            name={
                                mostrarContrasenas
                                    ? "eye-off-outline"
                                    : "eye-outline"
                            }
                            size={19}
                            color={colors.text}
                        />
                        <Text style={styles.showPasswordText}>
                            {mostrarContrasenas
                                ? "Ocultar contraseñas"
                                : "Mostrar contraseñas"}
                        </Text>
                    </Pressable>

                    {/* Enviar el formulario al backend. */}
                    <Pressable
                        style={[
                            styles.button,
                            guardando && styles.buttonDisabled,
                        ]}
                        onPress={guardarCambios}
                        disabled={guardando}
                    >
                        <Text style={styles.buttonText}>
                            {guardando
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modal personalizado para avisos, errores y confirmaciones. */}
            <Modal
                visible={mensajeModal !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setMensajeModal(null)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmBox}>
                        <View
                            style={[
                                styles.confirmIconContainer,
                                {
                                    backgroundColor: esExito
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
                                color={colorIcono}
                            />
                        </View>

                        <Text style={styles.confirmTitle}>
                            {mensajeModal?.titulo}
                        </Text>

                        <Text style={styles.confirmSubtitle}>
                            {mensajeModal?.mensaje}
                        </Text>

                        <Pressable
                            style={styles.confirmButton}
                            onPress={aceptarMensaje}
                        >
                            <Text style={styles.confirmButtonText}>
                                Aceptar
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Estilos de la pantalla siguiendo el diseño de la aplicación.
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 35,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 24,
        alignSelf: "flex-start",
    },
    backText: {
        color: colors.text,
        fontSize: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.text,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 6,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
        color: colors.text,
        marginBottom: 16,
    },
    showPasswordButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        marginBottom: 18,
    },
    showPasswordText: {
        color: colors.text,
        fontSize: 13,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        alignItems: "center",
        padding: 14,
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: colors.white,
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    confirmIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
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
    confirmButton: {
        width: "100%",
        backgroundColor: colors.primary,
        paddingVertical: 13,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.white,
    },
});
