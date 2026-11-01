import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
  const fechaLimpia =
    fecha?.split("T")[0] || "";

  const fechaFormateada =
    fechaLimpia
      ? new Date(
          `${fechaLimpia}T12:00:00`
        ).toLocaleDateString(
          "es-SV",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Fecha no disponible";

  const horaLimpia =
    hora?.slice(0, 5) || "";

  let horaFormateada =
    "Hora no disponible";

  if (horaLimpia) {
    const [
      horas,
      minutos,
    ] =
      horaLimpia.split(":");

    const numeroHora =
      Number(horas);

    horaFormateada =
      `${
        numeroHora % 12 ||
        12
      }:${minutos} ${
        numeroHora >= 12
          ? "p. m."
          : "a. m."
      }`;
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <Text
        style={
          styles.sectionTitle
        }
      >
        Tu próxima cita
      </Text>

      <Pressable
        onPress={onPress}
        style={({
          pressed,
        }) => [
          styles.card,
          pressed &&
            styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Ver cita de ${tratamiento}, ${fechaFormateada}, ${horaFormateada}`}
      >
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.icon
            }
          >
            <MaterialCommunityIcons
              name="tooth-outline"
              size={25}
              color={colors.primaryDark}
            />
          </View>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.treatment
              }
            >
              {tratamiento}
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Próxima cita
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={23}
            color={
              colors.primary
            }
          />
        </View>

        <View
          style={
            styles.divider
          }
        />

        <View
          style={
            styles.detailRow
          }
        >
          <Ionicons
            name="calendar-outline"
            size={21}
            color={
              colors.primary
            }
          />

          <Text
            style={
              styles.detail
            }
          >
            {fechaFormateada}
          </Text>
        </View>

        <View
          style={
            styles.detailRow
          }
        >
          <Ionicons
            name="time-outline"
            size={21}
            color={
              colors.primary
            }
          />

          <Text
            style={
              styles.detail
            }
          >
            {horaFormateada}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      marginTop: 24,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        colors.text,
      marginBottom: 12,
    },

    card: {
      backgroundColor:
        "#F0E8E6",
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor:
        colors.primaryDark,
    },

    pressed: {
      opacity: 0.75,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    icon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFF9F9",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    headerText: {
      flex: 1,
    },

    treatment: {
      fontSize: 15,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    subtitle: {
      fontSize: 13,
      color:
        colors.textSecondary,
      marginTop: 4,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 16,
    },

    detailRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginBottom: 10,
    },

    detail: {
      fontSize: 14,
      color:
        colors.text,
      flexShrink: 1,
    },
  });