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

  const diasLaborales = ["lunes", "martes", "miércoles", "jueves", "viernes"];
  const horariosLaborales = diasLaborales.map((dia) =>
    horarios.find((horario) => horario.dia_semana.trim().toLowerCase() === dia)
  );
  const horarioBase = horariosLaborales[0];
  const horarioEntreSemana =
    horarioBase &&
    horariosLaborales.every(
      (horario) =>
        horario &&
        horario.hora_inicio === horarioBase.hora_inicio &&
        horario.hora_fin === horarioBase.hora_fin
    )
      ? horarioBase
      : null;
  const horarioSabado = horarios.find((horario) =>
    /^s[aá]bado$/i.test(horario.dia_semana.trim())
  );

  return (
    <>
      <Text style={styles.sectionTitle}>Horarios de atención</Text>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="time-outline" size={23} color={colors.primaryDark} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Estamos para atenderte</Text>
            <Text style={styles.headerSubtitle}>Planificá tu próxima visita</Text>
          </View>
        </View>

        {cargando ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : horarios.length > 0 ? (
          <View style={styles.body}>
            <View style={styles.scheduleRow}>
              <Text style={styles.day}>Lunes a viernes</Text>
              <Text style={styles.time}>
                {horarioEntreSemana
                  ? `${formatearHora(horarioEntreSemana.hora_inicio)} a ${formatearHora(horarioEntreSemana.hora_fin)}`
                  : "Consultá disponibilidad"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.scheduleRow}>
              <Text style={styles.day}>Sábado</Text>
              <Text style={styles.time}>
                {horarioSabado
                  ? `${formatearHora(horarioSabado.hora_inicio)} a ${formatearHora(horarioSabado.hora_fin)}`
                  : "Consultá disponibilidad"}
              </Text>
            </View>

            <View style={styles.notice}>
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={colors.primaryDark}
              />
              <Text style={styles.noticeText}>
                Los horarios pueden variar en días feriados.
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Horarios no disponibles.</Text>
        )}
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
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    paddingVertical: 16,
    backgroundColor: colors.primaryLight,
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  body: {
    padding: 18,
  },
  scheduleRow: {
    paddingVertical: 5,
  },
  day: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  time: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 13,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 18,
    gap: 9,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.primaryDark,
  },
  loading: {
    padding: 24,
  },
  emptyText: {
    padding: 20,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
