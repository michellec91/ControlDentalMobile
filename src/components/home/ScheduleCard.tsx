import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export default function ScheduleCard() {
  return (
    <>
      <Text style={styles.sectionTitle}>Horarios de atención</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.day}>Lunes a viernes</Text>
            <Text style={styles.time}>8:00 a. m. – 5:00 p. m.</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons
              name="time-outline"
              size={21}
              color={colors.primary}
            />
          </View>

          <View>
            <Text style={styles.day}>Sábado</Text>
            <Text style={styles.time}>8:00 a. m. – 12:00 m.</Text>
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
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  row: {
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

  day: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  time: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});