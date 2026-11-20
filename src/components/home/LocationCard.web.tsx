import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../context/ThemeContext";

const MAP_URL =
  "https://www.openstreetmap.org/export/embed.html" +
  "?bbox=-89.238%2C13.710%2C-89.226%2C13.716" +
  "&layer=mapnik" +
  "&marker=13.71281%2C-89.23223";

export default function LocationCard() {
  const { colors, modoActual } = useAppTheme();
  const styles = createStyles(colors, modoActual);

  return (
    <>
      <Text style={styles.sectionTitle}>Encontranos</Text>

      <View style={styles.card}>
        <iframe
          title="Mapa interactivo de Clínica Dental Sonrisas"
          src={MAP_URL}
          loading="lazy"
          style={{
            width: "100%",
            height: 210,
            border: 0,
            display: "block",
            backgroundColor: colors.surface,
            filter:
              modoActual === "dark"
                ? "invert(90%) hue-rotate(180deg)"
                : "none",
          }}
        />

        <View style={styles.info}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Ubicación</Text>
              <Text style={styles.text}>
                75 ave norte Colonia Escalón, San Salvador, El Salvador.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Contacto</Text>
              <Text style={styles.text}>+503 7331-1305</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  modoActual: "light" | "dark"
) => StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    padding: 17,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: modoActual === "dark" ? colors.input : colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
});
