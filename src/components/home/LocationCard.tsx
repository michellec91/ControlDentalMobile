import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function LocationCard() {
  return (
    <>
      <Text style={styles.sectionTitle}>Encontranos</Text>

      <View style={styles.card}>
        {/* MAPA */}
        <Image
          source={require("../../../assets/images/clinic-map.png")}
          style={styles.map}
          resizeMode="cover"
        />

        {/* INFORMACIÓN */}
        <View style={styles.info}>
          {/* UBICACIÓN */}
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

          {/* CONTACTO */}
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

              <Text style={styles.text}>
                +503 7331-1305
              </Text>
            </View>
          </View>
        </View>
      </View>
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

  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },

  map: {
    width: "100%",
    height: 190,
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
    backgroundColor: colors.primaryLight,
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