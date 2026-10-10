import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function HeroCard() {
  return (
    <View style={styles.hero}>
      <View style={styles.icon}>
        <Ionicons
          name="sparkles-outline"
          size={24}
          color={colors.primary}
        />
      </View>

      <Text style={styles.eyebrow}>TU SALUD DENTAL</Text>

      <Text style={styles.title}>
        Tu sonrisa, más fácil de cuidar
      </Text>

      <Text style={styles.text}>
        Consultá nuestros tratamientos y gestioná tus citas desde un solo lugar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primaryLight,
    borderRadius: 26,
    padding: 24,
  },

  icon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 7,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});