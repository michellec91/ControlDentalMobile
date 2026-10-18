
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

// Tipos de mensajes del modal personalizado.
type MensajeModal = {
    titulo: string;
    mensaje: string;
    tipo: "exito" | "error" | "advertencia";
    alAceptar?: () => void;
};

export default function EditProfileScreen() {
    const { usuario, login } = useAuth();

    // Datos del formulario.
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Control del modal de mensajes.
    const [mensajeModal, setMensajeModal] =
        useState<MensajeModal | null>(null);

    // Cargar los datos originales del usuario.
    useEffect(() => {
        if (!usuario) return;

        setNombre(usuario.nombre ?? usuario.name ?? "");
        setApellido(usuario.apellido ?? "");
        setCorreo(usuario.correo ?? usuario.email ?? "");
        setTelefono(usuario.telefono ?? "");
    }, [usuario]);

    // Volver a la pantalla de perfil.
    const volverPerfil = () => {
        router.replace("/profile");
    };

    // Mostrar un mensaje en la ventana personalizada.
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

    // Cerrar el modal y ejecutar la acción correspondiente.
    const aceptarMensaje = () => {
        const accion = mensajeModal?.alAceptar;
        setMensajeModal(null);
        accion?.();
    };

    // Validar los datos y guardar los cambios.
    const guardarCambios = async () => {
        const nombreLimpio = nombre.trim();
        const apellidoLimpio = apellido.trim();
        const correoLimpio = correo.trim();
        const telefonoLimpio = telefono.trim();

        // Comprobar que todos los campos estén completos.
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

        // Permitir letras, tildes, ñ y espacios en nombres y apellidos.
        const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;

        if (!patronNombre.test(nombreLimpio)) {
            abrirMensajePersonalizado(
                "Nombre inválido",
                "El nombre solo puede contener letras y espacios.",
                "advertencia"
            );
            return;
        }

        if (!patronNombre.test(apellidoLimpio)) {
            abrirMensajePersonalizado(
                "Apellido inválido",
                "El apellido solo puede contener letras y espacios.",
                "advertencia"
            );
            return;
        }

        // Validar el formato del correo electrónico.
        const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!patronCorreo.test(correoLimpio)) {
            abrirMensajePersonalizado(
                "Correo inválido",
                "Ingresa un correo electrónico válido. Ejemplo: usuario@gmail.com",
                "advertencia"
            );
            return;
        }

        // Aceptar teléfonos internacionales con o sin prefijo +.
        const patronTelefono = /^\+?\d{8,15}$/;

        if (!patronTelefono.test(telefonoLimpio)) {
            abrirMensajePersonalizado(
                "Teléfono inválido",
                "Ingresa un número de teléfono válido con entre 8 y 15 dígitos. Puedes incluir el prefijo internacional +.",
                "advertencia"
            );
            return;
        }

        // Comprobar si los datos son iguales a los originales.
        const datosSinCambios =
            nombreLimpio ===
            (usuario?.nombre ?? usuario?.name ?? "").trim() &&
            apellidoLimpio === (usuario?.apellido ?? "").trim() &&
            correoLimpio ===
            (usuario?.correo ?? usuario?.email ?? "").trim() &&
            telefonoLimpio === (usuario?.telefono ?? "").trim();

        if (datosSinCambios) {
            abrirMensajePersonalizado(
                "No hay cambios",
                "No modificaste ningún dato de tu perfil.",
                "advertencia"
            );
            return;
        }

        // Obtener el identificador del usuario.
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
            setGuardando(true);

            // Enviar los datos actualizados al backend.
            const respuesta = await fetch(
                `${API_URL}/usuarios/${idUsuario}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombre: nombreLimpio,
                        apellido: apellidoLimpio,
                        correo: correoLimpio,
                        telefono: telefonoLimpio,
                    }),
                }
            );

            // Leer la respuesta del servidor.
            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.error ||
                    datos.mensaje ||
                    "No se pudo actualizar el perfil."
                );
            }

            // Actualizar los datos de la sesión.
            await login({
                ...usuario,
                ...datos.usuario,
                id_usuario: idUsuario,
            });

            // Confirmar que se guardaron los cambios.
            abrirMensajePersonalizado(
                "¡Perfil actualizado!",
                "Tus datos se guardaron correctamente.",
                "exito",
                volverPerfil
            );
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar los cambios.";

            abrirMensajePersonalizado(
                "No se pudo actualizar",
                mensaje,
                "error"
            );
        } finally {
            setGuardando(false);
        }
    };

    // Definir el icono y color del modal.
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
                {/* Botón para volver al perfil. */}
                <Pressable
                    style={styles.backButton}
                    onPress={volverPerfil}
                >
                    <Ionicons
                        name="arrow-back"
                        size={21}
                        color={colors.text}
                    />
                    <Text style={styles.backText}>Volver</Text>
                </Pressable>

                <Text style={styles.title}>Editar perfil</Text>
                <Text style={styles.subtitle}>
                    Actualiza tu información personal.
                </Text>

                {/* Formulario de información personal. */}
                <View style={styles.card}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu nombre"
                        placeholderTextColor={colors.textSecondary}
                        value={nombre}
                        onChangeText={(texto) =>
                            setNombre(
                                texto.replace(
                                    /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
                                    ""
                                )
                            )
                        }
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu apellido"
                        placeholderTextColor={colors.textSecondary}
                        value={apellido}
                        onChangeText={(texto) =>
                            setApellido(
                                texto.replace(
                                    /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g,
                                    ""
                                )
                            )
                        }
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Correo electrónico</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="correo@ejemplo.com"
                        placeholderTextColor={colors.textSecondary}
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej. 77036701 o +14155552671"
                        placeholderTextColor={colors.textSecondary}
                        value={telefono}
                        onChangeText={(texto) => {
                            // Permitir números y un + únicamente al inicio.
                            const limpio = texto.replace(/[^\d+]/g, "");
                            const normalizado = limpio.startsWith("+")
                                ? "+" +
                                limpio.slice(1).replace(/\+/g, "")
                                : limpio.replace(/\+/g, "");

                            setTelefono(normalizado);
                        }}
                        keyboardType="phone-pad"
                    />

                    {/* Botón para guardar los cambios. */}
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

// Estilos de la pantalla y del modal.
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
