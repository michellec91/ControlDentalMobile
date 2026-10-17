
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Alert,
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
    const { usuario, logout } = useAuth();

    // Obtener los datos del usuario guardados en la sesión.
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

    // Confirmar antes de cerrar la sesión.
    const cerrarSesion = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro de que deseas cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace("/(auth)/login");
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
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
        </SafeAreaView>
    );
}

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
});
