
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";

type Props = {
    fecha: string;
    hora: string;
    tratamiento: string;
    onPress: () => void;
};

export default function NextAppointmentCard({
    fecha,
    hora,
    tratamiento,
    onPress,
}: Props) {
    const fechaFormateada = new Date(
        `${fecha.split("T")[0]}T12:00:00`
    ).toLocaleDateString("es-SV", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const [horas, minutos] = hora.split(":");
    const horaFormateada = `${Number(horas) % 12 || 12}:${minutos} ${Number(horas) >= 12 ? "p. m." : "a. m."
        }`;

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Tu próxima cita</Text>

            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Ver cita de ${tratamiento}, ${fechaFormateada}, ${horaFormateada}`}
            >
                <View style={styles.header}>
                    <View style={styles.icon}>
                        <Ionicons
                            name="calendar-outline"
                            size={22}
                            color={colors.primary}
                        />
                    </View>

                    <View style={styles.headerText}>
                        <Text style={styles.treatment}>{tratamiento}</Text>
                        <Text style={styles.subtitle}>Próxima cita</Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={22}
                        color={colors.primary}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Ionicons
                        name="calendar-clear-outline"
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.detail}>{fechaFormateada}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons
                        name="time-outline"
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.detail}>{horaFormateada}</Text>
                </View>

                <Text style={styles.action}>Ver mis citas</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 12,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pressed: {
        opacity: 0.75,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    headerText: {
        flex: 1,
    },
    treatment: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.text,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    detail: {
        fontSize: 14,
        color: colors.text,
        flexShrink: 1,
    },
    action: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
        marginTop: 6,
    },
});
