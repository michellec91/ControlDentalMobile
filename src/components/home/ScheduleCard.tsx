import { Ionicons } from "@expo/vector-icons";
import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/theme";
import { obtenerHorarios } from "../../services/api";

type Horario = {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
};

export default function ScheduleCard() {
  const [
    horarios,
    setHorarios,
  ] =
    useState<Horario[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  useEffect(() => {
    const cargarHorarios =
      async () => {
        try {
          const datos =
            await obtenerHorarios();

          const activos =
            Array.isArray(
              datos
            )
              ? datos.filter(
                  (
                    horario: Horario
                  ) =>
                    horario.estado
                      ?.toLowerCase() ===
                    "activo"
                )
              : [];

          setHorarios(
            activos
          );
        } catch (error) {
          console.error(
            "Error al cargar horarios:",
            error
          );

          setHorarios([]);
        } finally {
          setCargando(false);
        }
      };

    cargarHorarios();
  }, []);

  const formatearHora = (
    hora: string
  ) => {
    const [
      horas,
      minutos,
    ] =
      hora
        .slice(0, 5)
        .split(":");

    const numeroHora =
      Number(horas);

    if (
      numeroHora === 0
    ) {
      return `12:${minutos} a. m.`;
    }

    if (
      numeroHora === 12
    ) {
      return `12:${minutos} p. m.`;
    }

    if (
      numeroHora > 12
    ) {
      return `${
        numeroHora - 12
      }:${minutos} p. m.`;
    }

    return `${numeroHora}:${minutos} a. m.`;
  };

  return (
    <>
      <Text
        style={
          styles.sectionTitle
        }
      >
        Horarios de atención
      </Text>

      <View
        style={styles.card}
      >
        {cargando ? (
          <ActivityIndicator
            color={
              colors.primary
            }
          />
        ) : horarios.length >
          0 ? (
          horarios.map(
            (
              horario,
              index
            ) => (
              <View
                key={
                  horario.id_horario
                }
              >
                <View
                  style={
                    styles.row
                  }
                >
                  <View
                    style={
                      styles.icon
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={
                        21
                      }
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.textContainer
                    }
                  >
                    <Text
                      style={
                        styles.day
                      }
                    >
                      {
                        horario.dia_semana
                      }
                    </Text>

                    <Text
                      style={
                        styles.time
                      }
                    >
                      {formatearHora(
                        horario.hora_inicio
                      )}{" "}
                      –{" "}
                      {formatearHora(
                        horario.hora_fin
                      )}
                    </Text>
                  </View>
                </View>

                {index <
                  horarios.length -
                    1 && (
                  <View
                    style={
                      styles.divider
                    }
                  />
                )}
              </View>
            )
          )
        ) : (
          <Text
            style={
              styles.emptyText
            }
          >
            Horarios no
            disponibles.
          </Text>
        )}
      </View>
    </>
  );
}

const styles =
  StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        colors.text,
      marginTop: 28,
      marginBottom: 12,
    },

    card: {
      backgroundColor:
        colors.surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    row: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    textContainer: {
      flex: 1,
    },

    icon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        colors.primaryLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    day: {
      fontSize: 15,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    time: {
      fontSize: 14,
      color:
        colors.textSecondary,
      marginTop: 3,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 16,
    },

    emptyText: {
      fontSize: 13,
      color:
        colors.textSecondary,
      textAlign:
        "center",
    },
  });