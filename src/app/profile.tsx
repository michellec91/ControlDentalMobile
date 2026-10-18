
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
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

export default function ProfileScreen() {
    // Obtener los datos del usuario y la función para cerrar sesión.
    const { usuario, logout } = useAuth();

    // Controlar la visibilidad de la confirmación personalizada.
    const [modalLogoutVisible, setModalLogoutVisible] = useState(false);

    // Obtener el nombre completo y los datos de contacto.
    const nombreCompleto =
        [usuario?.nombre ?? usuario?.name, usuario?.apellido]
            .filter(Boolean)
            .join(" ") || "Usuario";

    const correo = usuario?.correo ?? usuario?.email ?? "No disponible";
    const telefono = usuario?.telefono || "No disponible";

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

            // Eliminar los datos de sesión guardados.
            await logout();

            // Redirigir a la pantalla de inicio de sesión.
            router.replace("/(auth)/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);

            // Mostrar un mensaje compatible con web y móvil.
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
                {/* Barra superior con el botón para regresar al inicio. */}
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

                {/* Icono del perfil del usuario. */}
                <View style={styles.avatar}>
                    <Ionicons
                        name="person-circle-outline"
                        size={58}
                        color={colors.primary}
                    />
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

                    {/* Abrir el formulario para editar los datos personales. */}
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

                    {/* Abrir la pantalla para cambiar la contraseña. */}
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

                {/* Botón que abre la confirmación personalizada. */}
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

            {/* Confirmación personalizada para web, Android e iOS. */}
            <Modal
                visible={modalLogoutVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalLogoutVisible(false)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmBox}>
                        {/* Icono de cierre de sesión. */}
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

                        {/* Botones para cancelar o confirmar el cierre. */}
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

// Estilos de la pantalla de perfil y de su confirmación.
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

    // Fondo oscuro que cubre la pantalla detrás de la confirmación.
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
