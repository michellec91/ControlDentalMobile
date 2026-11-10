import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../components/home/Header";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { obtenerDocumentos } from "../services/firestore";

interface CitaFirebase {
  id: string;
  id_usuario?: number;
  id_tratamiento?: number;
  tratamiento_nombre?: string;
  fecha: string;
  hora: string;
  estado: string;
  uid?: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  const { colors, modoActual } = useAppTheme();
  const styles = createStyles(colors, modoActual);

  const [citas, setCitas] = useState<CitaFirebase[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "confirmada" | "cancelada">(
    "todas",
  );

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const cargarDatosFirestore = useCallback(async () => {
    setCargando(true);

    try {
      if (!usuario || !usuario.uid) {
        setCitas([]);
        setMensaje({
          tipo: "error",
          texto: "Debes iniciar sesión para ver tu historial.",
        });
        return;
      }

      const data = await obtenerDocumentos("citas", usuario.uid);

      const lista: CitaFirebase[] = (data || []).map((item: any) => ({
        id: item.id,
        fecha: item.fecha || "",
        hora: item.hora || "",
        estado: item.estado || "confirmada",
        tratamiento_nombre:
          item.tratamiento_nombre || item.tratamiento || "Tratamiento dental",
        uid: item.uid,
      }));

      // EXCLUIR ESTRICTAMENTE LAS PENDIENTES (Solo Confirmadas y Canceladas)
      const listaHistorial = lista.filter((cita) => {
        const est = cita.estado?.toLowerCase().trim();
        return (
          est === "confirmada" || est === "cancelada" || est === "completada"
        );
      });

      // Aplicar pestañas de filtro seleccionadas
      let citasFiltradas = listaHistorial;
      if (filtro === "confirmada") {
        citasFiltradas = listaHistorial.filter((cita) => {
          const est = cita.estado?.toLowerCase().trim();
          return est === "confirmada" || est === "completada";
        });
      } else if (filtro === "cancelada") {
        citasFiltradas = listaHistorial.filter(
          (cita) => cita.estado?.toLowerCase().trim() === "cancelada",
        );
      }

      // Ordenar por fecha y hora descendente
      citasFiltradas.sort((a, b) => {
        const fechaA = `${a.fecha.split("T")[0]}T${a.hora}`;
        const fechaB = `${b.fecha.split("T")[0]}T${b.hora}`;
        return new Date(fechaB).getTime() - new Date(fechaA).getTime();
      });

      setCitas(citasFiltradas);
      setMensaje(null);
    } catch (error) {
      console.error("Error al cargar historial desde Firestore:", error);
      setCitas([]);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No fue posible cargar tu historial de la nube.",
      });
    } finally {
      setCargando(false);
    }
  }, [usuario, filtro]);

  useFocusEffect(
    useCallback(() => {
      cargarDatosFirestore();
    }, [cargarDatosFirestore]),
  );

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "-";
    const fechaLimpia = fecha.includes("T") ? fecha.split("T")[0] : fecha;
    return new Date(`${fechaLimpia}T00:00:00`).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatearHora = (hora: string) => {
    if (!hora) return "-";
    const [horas, minutos] = hora.slice(0, 5).split(":");
    const numeroHora = Number(horas);

    if (numeroHora === 0) return `12:${minutos} a. m.`;
    if (numeroHora === 12) return `12:${minutos} p. m.`;
    if (numeroHora > 12) return `${numeroHora - 12}:${minutos} p. m.`;
    return `${numeroHora}:${minutos} a. m.`;
  };

  const formatearEstado = (estado: string) => {
    const valor = estado?.toLowerCase().trim();
    if (valor === "confirmada") return "Confirmada";
    if (valor === "completada") return "Completada";
    if (valor === "cancelada") return "Cancelada";
    return estado || "-";
  };

  const obtenerEstiloEstado = (estado: string) => {
    const valor = estado?.toLowerCase().trim();
    if (valor === "confirmada") return styles.statusConfirmed;
    if (valor === "cancelada") return styles.statusCancelled;
    if (valor === "completada") return styles.statusCompleted;
    return styles.statusDefault;
  };

  const nombreCompleto = usuario
    ? [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim()
    : "Usuario";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 12 },
      ]}
    >
      <Header />

      <View style={styles.branding}>
        <View style={styles.logoBox}>
          <Ionicons name="medical-outline" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.brandTitle}>Control Dental</Text>
        <Text style={styles.brandSubtitle}>CLÍNICA DENTAL SONRISAS</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.welcomeText}>Hola {nombreCompleto},</Text>
        <Text style={styles.sectionSubtitle}>Historial de tus citas:</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filtro === "todas" && styles.filterBtnActive,
            ]}
            onPress={() => setFiltro("todas")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filtro === "todas" && styles.filterBtnTextActive,
              ]}
            >
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filtro === "confirmada" && styles.filterBtnActive,
            ]}
            onPress={() => setFiltro("confirmada")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filtro === "confirmada" && styles.filterBtnTextActive,
              ]}
            >
              Confirmadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              filtro === "cancelada" && styles.filterBtnActive,
            ]}
            onPress={() => setFiltro("cancelada")}
          >
            <Text
              style={[
                styles.filterBtnText,
                filtro === "cancelada" && styles.filterBtnTextActive,
              ]}
            >
              Canceladas
            </Text>
          </TouchableOpacity>
        </View>

        {mensaje ? (
          <View
            style={
              mensaje.tipo === "exito" ? styles.successBox : styles.errorBox
            }
          >
            <Text
              style={
                mensaje.tipo === "exito" ? styles.successText : styles.errorText
              }
            >
              {mensaje.tipo === "exito" ? "✓ " : "⚠️ "}
              {mensaje.texto}
            </Text>
          </View>
        ) : null}

        {cargando ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: 20 }}
          />
        ) : citas.length > 0 ? (
          citas.map((cita) => {
            const estado = cita.estado?.toLowerCase().trim();

            return (
              <View key={cita.id} style={styles.appointmentCard}>
                <View style={styles.dateHeader}>
                  <Text style={styles.calendarIcon}>📅</Text>
                  <Text style={styles.dateText}>
                    {formatearFecha(cita.fecha)}
                  </Text>
                </View>

                <Text style={styles.hourText}>
                  🕒 {formatearHora(cita.hora)}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.label}>Tratamiento:</Text>
                <Text style={styles.valueText}>
                  🦷 {cita.tratamiento_nombre || "Tratamiento dental"}
                </Text>

                <Text style={styles.label}>Estado:</Text>
                <Text style={obtenerEstiloEstado(cita.estado)}>
                  {estado === "confirmada" || estado === "completada"
                    ? "✓ "
                    : estado === "cancelada"
                      ? "✕ "
                      : ""}
                  {formatearEstado(cita.estado)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No hay registros en el historial de Firestore.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (
  colors: any,
  modoActual: "light" | "dark"
) =>
  StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },
  branding: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoBox: {
    width: 52,
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.8,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 6,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor:
    modoActual === "dark"
      ? colors.input
      : "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  filterBtnTextActive: {
    color: colors.white,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  appointmentCard: {
    backgroundColor:
    modoActual === "dark"
      ? colors.input
      : "#E0F2FE",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  hourText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#CBD5E1",
    marginVertical: 8,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 4,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  statusConfirmed: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  statusCompleted: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 4,
  },
  statusCancelled: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
    marginBottom: 4,
  },
  statusDefault: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  emptyBox: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
