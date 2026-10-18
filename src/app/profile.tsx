
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
    // Obtener los datos del usuario y las funciones de sesión.
    const { usuario, logout, login } = useAuth();

    // Controlar el modal de cierre de sesión y la subida de la foto.
    const [modalLogoutVisible, setModalLogoutVisible] = useState(false);
    const [subiendoFoto, setSubiendoFoto] = useState(false);

    // Obtener los datos personales del usuario.
    const nombreCompleto =
        [usuario?.nombre ?? usuario?.name, usuario?.apellido]
            .filter(Boolean)
            .join(" ") || "Usuario";

    const correo = usuario?.correo ?? usuario?.email ?? "No disponible";
    const telefono = usuario?.telefono || "No disponible";

    // Construir la dirección de la foto guardada en el servidor.
    const fotoPerfil = usuario?.imagen_perfil
        ? `${API_URL}${usuario.imagen_perfil}`
        : null;

    // Seleccionar una imagen y subirla al backend.
    const seleccionarFoto = async () => {
        try {
            const resultado =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            // Si se cancela el selector, no hacer nada.
            if (resultado.canceled || !resultado.assets?.length) {
                return;
            }

            const imagen = resultado.assets[0];
            const idUsuario =
                usuario?.id_usuario ?? usuario?.id_user;

            if (!idUsuario) {
                throw new Error(
                    "No se encontró el identificador del usuario."
                );
            }

            // Preparar el archivo para enviarlo al servidor.
            const formulario = new FormData();

            if (Platform.OS === "web") {
                if (!imagen.file) {
                    throw new Error(
                        "No se pudo leer la imagen seleccionada. Inténtalo de nuevo."
                    );
                }

                formulario.append("foto", imagen.file);
            } else {
                formulario.append(
                    "foto",
                    {
                        uri: imagen.uri,
                        name: imagen.fileName || "foto-perfil.jpg",
                        type: imagen.mimeType || "image/jpeg",
                    } as any
                );
            }

            setSubiendoFoto(true);

            // Enviar la imagen a la ruta que configuramos en el backend.
            const respuesta = await fetch(
                `${API_URL}/usuarios/${idUsuario}/foto-perfil`,
                {
                    method: "PUT",
                    body: formulario,
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(
                    datos.error || "No se pudo guardar la foto."
                );
            }

            // Actualizar la sesión y conservar los demás datos del usuario.
            await login({
                ...usuario,
                imagen_perfil: datos.imagen_perfil,
            });

            // Confirmar que la imagen se guardó.
            if (Platform.OS === "web") {
                window.alert(
                    "¡Foto actualizada!\n\nTu foto de perfil se guardó correctamente."
                );
            } else {
                Alert.alert(
                    "¡Foto actualizada!",
                    "Tu foto de perfil se guardó correctamente."
                );
            }
        } catch (error) {
            console.error("Error al actualizar la foto:", error);

            const mensaje =
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la foto.";

            if (Platform.OS === "web") {
                window.alert(`Error\n\n${mensaje}`);
            } else {
                Alert.alert("Error", mensaje);
            }
        } finally {
            setSubiendoFoto(false);
        }
    };

    // Regresar a la pantalla principal.
    const volverInicio = () => {
        router.replace("/home");
    };

    // Mostrar la confirmación antes de cerrar la sesión.
    const cerrarSesion = () => {
        setModalLogoutVisible(true);
    };

    // Cerrar la sesión solamente cuando el usuario confirme.
    const confirmarCierreSesion = async () => {
        try {
            setModalLogoutVisible(false);
            await logout();
            router.replace("/(auth)/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            if (Platform.OS === "web") {
                window.alert(
                    "Error\n\nNo se pudo cerrar la sesión. Inténtalo nuevamente."
                );
            } else {
                Alert.alert(
                    "Error",
                    "No se pudo cerrar la sesión. Inténtalo nuevamente."
                );
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Barra superior. */}
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

                {/* Foto de perfil con opción para cambiarla. */}
                <View style={styles.avatar}>
                    <Pressable
                        onPress={seleccionarFoto}
                        disabled={subiendoFoto}
                        accessibilityRole="button"
                        accessibilityLabel="Cambiar foto de perfil"
                        style={styles.avatarButton}
                    >
                        {fotoPerfil ? (
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

                        <View style={styles.cameraBadge}>
                            <Ionicons
                                name="camera"
                                size={16}
                                color={colors.white}
                            />
                        </View>
                    </Pressable>

                    {subiendoFoto ? (
                        <View style={styles.uploadStatus}>
                            <ActivityIndicator color={colors.primary} />
                            <Text style={styles.changePhotoText}>
                                Guardando foto...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.changePhotoText}>
                            Cambiar foto
                        </Text>
                    )}
                </View>

                {/* Información personal del usuario. */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Información personal
                    </Text>

                    <Text style={styles.label}>Nombre completo</Text>
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

                    <Text style={styles.label}>Teléfono</Text>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            {telefono}
                        </Text>
                    </View>

                    {/* Abrir el formulario de edición del perfil. */}
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

                {/* Opciones de seguridad de la cuenta. */}
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

                    <Text style={styles.label}>Contraseña</Text>
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

                {/* Botón para cerrar sesión. */}
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

            {/* Confirmación personalizada para cerrar sesión. */}
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
                                style={[
                                    styles.confirmBtn,
                                    styles.cancelBtn,
                                ]}
                                onPress={() =>
                                    setModalLogoutVisible(false)
                                }
                            >
                                <Text style={styles.cancelBtnText}>
                                    No
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.confirmBtn,
                                    styles.acceptBtn,
                                ]}
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

// Estilos de la pantalla y de los modales.
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
    cameraBadge: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.surface,
    },
    uploadStatus: {
        alignItems: "center",
        marginTop: 8,
        gap: 5,
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
        shadowOffset: { width: 0, height: 4 },
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
