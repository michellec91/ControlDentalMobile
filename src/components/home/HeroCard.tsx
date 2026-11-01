import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function HeroCard() {
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.toothDecoration}>
        <MaterialCommunityIcons
          name="tooth-outline"
          size={152}
          color="rgba(255, 255, 255, 0.60)"
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
    backgroundColor: "#B8DCEF",
    borderRadius: 26,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },

  toothDecoration: {
    position: "absolute",
    right: -26,
    bottom: -22,
    transform: [{ rotate: "-13deg" }],
  },

  eyebrow: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
    maxWidth: "88%",
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    maxWidth: "80%",
  },
});
