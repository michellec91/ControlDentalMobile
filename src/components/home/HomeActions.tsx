import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function HomeActions() {
  return (
    <>
      <Text style={styles.sectionTitle}>¿Qué necesitás hoy?</Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push("/treatments")}
      >
        <View style={styles.textContainer}>
          <Text style={styles.primaryTitle}>Ver tratamientos</Text>

          <Text style={styles.primarySubtitle}>
            Consultá servicios, precios y duración
          </Text>
        </View>

        <View style={styles.arrow}>
          <Ionicons
            name="arrow-forward"
            size={21}
            color={colors.white}
          />
        </View>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push("/appointment/create")}
      >
        <View style={styles.secondaryIcon}>
          <Ionicons
            name="calendar-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.secondaryContent}>
          <Text style={styles.secondaryTitle}>Agendar una cita</Text>

          <Text style={styles.secondarySubtitle}>
            Elegí tratamiento, fecha y horario disponible
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.textSecondary}
        />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 28,
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  textContainer: {
    flex: 1,
  },

  primaryTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },

  primarySubtitle: {
    color: "#E4F3EE",
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  secondaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryContent: {
    flex: 1,
    marginLeft: 13,
  },

  secondaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  secondarySubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    marginTop: 3,
  },
});