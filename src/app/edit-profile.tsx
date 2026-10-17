
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Platform,
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

export default function EditProfileScreen() {
    // Obtener los datos del usuario y la función para actualizar su sesión.
    const { usuario, login } = useAuth();

    // Guardar los valores que el usuario escribe en el formulario.
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [telefono, setTelefono] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Cargar los datos actuales cuando la información de la sesión esté disponible.
    useEffect(() => {
        if (!usuario) return;

        setNombre(usuario.nombre ?? usuario.name ?? "");
        setApellido(usuario.apellido ?? "");
        setCorreo(usuario.correo ?? usuario.email ?? "");
        setTelefono(usuario.telefono ?? "");
    }, [usuario]);

    // Regresar a la pantalla del perfil.
    const volverPerfil = () => {
        router.replace("/profile");
    };

    // Mostrar mensajes de forma compatible con web y dispositivos móviles.
    const mostrarMensaje = (
        titulo: string,
        mensaje: string,
        alAceptar?: () => void
    ) => {
        if (Platform.OS === "web") {
            // En el navegador se utiliza la ventana de alerta web.
            window.alert(`${titulo}\n\n${mensaje}`);

            // Ejecutar la acción después de cerrar el mensaje, si existe.
            alAceptar?.();
        } else {
            // En Android e iOS se utiliza la alerta de React Native.
            Alert.alert(titulo, mensaje, [
                {
                    text: "Aceptar",
                    onPress: alAceptar,
                },
            ]);
        }
    };

    // Validar los datos y enviarlos al backend para guardar los cambios.
    const guardarCambios = async () => {
        // Eliminar espacios innecesarios al inicio y al final.
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
            mostrarMensaje(
                "Campos incompletos",
                "Completa todos los campos antes de continuar."
            );
            return;
        }

        // Comprobar que el correo tenga un formato válido.
        const correoValido =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio);

        if (!correoValido) {
            mostrarMensaje(
                "Correo inválido",
                "Ingresa un correo electrónico válido."
            );
            return;
        }

        // Obtener el identificador del usuario que inició sesión.
        const idUsuario = usuario?.id_usuario ?? usuario?.id_user;

        if (!idUsuario) {
            mostrarMensaje(
                "Error",
                "No se encontró el ID del usuario. Cierra sesión e inicia sesión nuevamente."
            );
            return;
        }

        try {
            // Desactivar temporalmente el botón mientras se guarda.
            setGuardando(true);

            // Enviar los datos nuevos al backend para actualizar MySQL.
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

            // Leer la respuesta enviada por el servidor.
            const datos = await respuesta.json();

            // Informar si el servidor no pudo actualizar los datos.
            if (!respuesta.ok) {
                throw new Error(
                    datos.error ||
                    datos.mensaje ||
                    "No se pudo actualizar el perfil."
                );
            }

            // Actualizar la sesión para que la aplicación utilice los datos nuevos.
            await login({
                ...usuario,
                ...datos.usuario,
                id_usuario: idUsuario,
            });

            // Confirmar el guardado y regresar al perfil al cerrar el mensaje.
            mostrarMensaje(
                "¡Perfil actualizado!",
                "Tus datos se guardaron correctamente.",
                volverPerfil
            );
        } catch (error) {
            // Mostrar el error que ocurrió durante el guardado.
            const mensaje =
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar los cambios.";

            mostrarMensaje("Error", mensaje);
        } finally {
            // Habilitar nuevamente el botón.
            setGuardando(false);
        }
    };

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

                {/* Título y descripción de la pantalla. */}
                <Text style={styles.title}>Editar perfil</Text>

                <Text style={styles.subtitle}>
                    Actualiza tu información personal.
                </Text>

                {/* Formulario con los datos personales del usuario. */}
                <View style={styles.card}>
                    <Text style={styles.label}>Nombre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu nombre"
                        placeholderTextColor={colors.textSecondary}
                        value={nombre}
                        onChangeText={setNombre}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Apellido</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ingresa tu apellido"
                        placeholderTextColor={colors.textSecondary}
                        value={apellido}
                        onChangeText={setApellido}
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
                        placeholder="Ingresa tu teléfono"
                        placeholderTextColor={colors.textSecondary}
                        value={telefono}
                        onChangeText={setTelefono}
                        keyboardType="phone-pad"
                    />

                    {/* Guardar los cambios y evitar pulsaciones repetidas. */}
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
        </SafeAreaView>
    );
}

// Estilos visuales de la pantalla de edición.
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
});
