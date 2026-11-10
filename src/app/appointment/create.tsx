import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  API_URL,
  obtenerHorarios,
  obtenerTratamientos,
} from "../../services/api";

import Header from "../../components/home/Header";
import { useAuth } from "../../context/AuthContext";
import { guardarDocumento } from "../../services/firestore";

interface Tratamiento {
  id_tratamiento: number;
  nombre: string;
  descripcion?: string;
  precio?: number | string;
  duracion?: number;
  estado?: string;
  imagen?: string | null;
}

interface Cita {
  id_cita: number;
  id_usuario: number;
  id_tratamiento: number;
  fecha: string;
  hora: string;
  estado: string;
}

interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
}

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { usuario, obtenerIdUsuario } = useAuth();

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(hoy.getDate()).padStart(2, "0")}`;

  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [mesActual, setMesActual] = useState(hoy.getMonth());

  const [mostrarModalCalendario, setMostrarModalCalendario] = useState(false);
  const [mostrarModalTratamientos, setMostrarModalTratamientos] =
    useState(false);

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tratamientoSeleccionado, setTratamientoSeleccionado] =
    useState<Tratamiento | null>(null);

  const [listaTratamientos, setListaTratamientos] = useState<Tratamiento[]>([]);
  const [citasExistentes, setCitasExistentes] = useState<Cita[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      setCargandoDatos(true);
      setError("");

      const resCitas = await fetch(`${API_URL}/citas`);
      const dataCitas = await resCitas.json().catch(() => []);

      if (!resCitas.ok) {
        throw new Error(
          dataCitas?.error || "No se pudieron obtener las citas.",
        );
      }

      setCitasExistentes(Array.isArray(dataCitas) ? dataCitas : []);

      const dataTratamientos = await obtenerTratamientos();
      const tratamientosActivos = Array.isArray(dataTratamientos)
        ? dataTratamientos.filter(
            (t: Tratamiento) =>
              !t.estado || t.estado.toLowerCase() === "activo",
          )
        : [];

      setListaTratamientos(tratamientosActivos);

      const dataHorarios = await obtenerHorarios();
      const horariosActivos = Array.isArray(dataHorarios)
        ? dataHorarios.filter(
            (h: Horario) => !h.estado || h.estado.toLowerCase() === "activo",
          )
        : [];

      setHorarios(horariosActivos);

      const paramTratamiento =
        params.treatmentId || params.id_tratamiento || params.tratamiento;

      if (paramTratamiento && tratamientosActivos.length > 0) {
        const encontrado = tratamientosActivos.find(
          (t: Tratamiento) =>
            String(t.id_tratamiento) === String(paramTratamiento) ||
            t.nombre === String(paramTratamiento),
        );
        if (encontrado) {
          setTratamientoSeleccionado(encontrado);
        }
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los datos.",
      );
    } finally {
      setCargandoDatos(false);
    }
  };

  const diasDelMes = useMemo(() => {
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const dias = [];

    const diaSemanaInicio = primerDia.getDay();
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const mesStr = String(mesActual + 1).padStart(2, "0");
      const diaStr = String(d).padStart(2, "0");
      dias.push(`${anioActual}-${mesStr}-${diaStr}`);
    }

    return dias;
  }, [anioActual, mesActual]);

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const cambiarMes = (direccion: number) => {
    let nuevoMes = mesActual + direccion;
    let nuevoAnio = anioActual;

    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    }

    setMesActual(nuevoMes);
    setAnioActual(nuevoAnio);
  };

  const obtenerNombreDia = (fechaSeleccionada: string) => {
    if (!fechaSeleccionada) return "";
    const fechaObj = new Date(`${fechaSeleccionada}T00:00:00`);
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    return dias[fechaObj.getDay()];
  };

  const normalizarTexto = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const generarHoras = (horaInicio: string, horaFin: string) => {
    const resultado: string[] = [];
    const [hInicio, mInicio] = horaInicio.slice(0, 5).split(":").map(Number);
    const [hFin, mFin] = horaFin.slice(0, 5).split(":").map(Number);

    let minutosActuales = hInicio * 60 + mInicio;
    const minutosFinales = hFin * 60 + mFin;

    while (minutosActuales <= minutosFinales) {
      const horas = Math.floor(minutosActuales / 60);
      const minutos = minutosActuales % 60;
      resultado.push(
        `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`,
      );
      minutosActuales += 60;
    }
    return resultado;
  };

  const horasDisponibles = useMemo(() => {
    if (!fecha) return [];
    const nombreDia = obtenerNombreDia(fecha);
    if (nombreDia === "domingo") return [];

    const horarioDia = horarios.find(
      (h) => normalizarTexto(h.dia_semana) === normalizarTexto(nombreDia),
    );

    if (!horarioDia) return [];

    const todasLasHoras = generarHoras(
      horarioDia.hora_inicio,
      horarioDia.hora_fin,
    );

    const ahora = new Date();
    const minutosHoraActual = ahora.getHours() * 60 + ahora.getMinutes();

    return todasLasHoras.filter((horaDisponible) => {
      if (fecha === hoyStr) {
        const [hSlot, mSlot] = horaDisponible.split(":").map(Number);
        const minutosSlot = hSlot * 60 + mSlot;
        if (minutosSlot <= minutosHoraActual) {
          return false;
        }
      }

      const horaBD = `${horaDisponible}:00`;
      const ocupada = citasExistentes.some((cita) => {
        const fechaCita = cita.fecha?.includes("T")
          ? cita.fecha.split("T")[0]
          : cita.fecha;
        const horaCita = cita.hora?.slice(0, 8);
        const estado = cita.estado?.toLowerCase().trim();

        return (
          fechaCita === fecha && horaCita === horaBD && estado !== "cancelada"
        );
      });

      return !ocupada;
    });
  }, [fecha, horarios, citasExistentes, hoyStr]);

  useEffect(() => {
    setHora("");
    if (!fecha) {
      setError("");
      return;
    }

    const nombreDia = obtenerNombreDia(fecha);
    if (nombreDia === "domingo") {
      setError("La clínica permanece cerrada los domingos.");
      return;
    }

    const horarioExiste = horarios.some(
      (h) => normalizarTexto(h.dia_semana) === normalizarTexto(nombreDia),
    );

    if (horarios.length > 0 && !horarioExiste) {
      setError("La clínica no posee un horario activo para ese día.");
      return;
    }
    setError("");
  }, [fecha, horarios]);

  const formatearHora = (hora24: string) => {
    const [horas, minutos] = hora24.slice(0, 5).split(":");
    const numeroHora = Number(horas);

    if (numeroHora === 0) return `12:${minutos} a. m.`;
    if (numeroHora === 12) return `12:${minutos} p. m.`;
    if (numeroHora > 12) return `${numeroHora - 12}:${minutos} p. m.`;
    return `${numeroHora}:${minutos} a. m.`;
  };

  const handleConfirmar = async () => {
    setError("");
    setExito("");

    if (!usuario) {
      setError("Debes iniciar sesión para solicitar una cita.");
      return;
    }

    if (!fecha) {
      setError("Por favor selecciona una fecha.");
      return;
    }

    if (fecha < hoyStr) {
      setError("No puedes solicitar una cita para una fecha pasada.");
      return;
    }

    if (!hora) {
      setError("Por favor selecciona una hora disponible.");
      return;
    }

    if (!tratamientoSeleccionado) {
      setError("Por favor selecciona un tratamiento.");
      return;
    }

    const horaBD = `${hora}:00`;

    try {
      setCargando(true);
      const idUsuario = await obtenerIdUsuario();
      const payload = {
        id_usuario: idUsuario,
        id_tratamiento: tratamientoSeleccionado.id_tratamiento,
        fecha,
        hora: horaBD,
      };

      const res = await fetch(`${API_URL}/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.mensaje || "No se pudo crear la solicitud.",
        );
      }

      setExito("¡Solicitud de cita enviada con éxito!");

      // Guardar en Firestore
      await guardarDocumento("citas", usuario.uid, {
        id_usuario: idUsuario,
        id_tratamiento: tratamientoSeleccionado.id_tratamiento,
        tratamiento_nombre: tratamientoSeleccionado.nombre,
        fecha,
        hora: horaBD,
        estado: "pendiente",
      });

      setTimeout(() => {
        router.replace("/appointments");
      }, 1000);
    } catch (error) {
      console.error("Error al crear cita:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error de conexión con el servidor.",
      );
    } finally {
      setCargando(false);
    }
  };

  if (cargandoDatos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088FF" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 12 },
      ]}
      keyboardShouldPersistTaps="handled"
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
        <Text style={styles.title}>Nueva cita</Text>
        <Text style={styles.subtitle}>
          Selecciona fecha, hora y tratamiento
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {exito ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {exito}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={styles.selectorBox}
          onPress={() => setMostrarModalCalendario(true)}
        >
          <Text
            style={
              fecha ? styles.selectorTextActive : styles.selectorTextPlaceholder
            }
          >
            {fecha ? `📅 ${fecha}` : "Seleccionar fecha..."}
          </Text>
          <Text style={styles.selectorIcon}>📅</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Tratamiento</Text>
        <TouchableOpacity
          style={styles.selectorBox}
          onPress={() => setMostrarModalTratamientos(true)}
        >
          <Text
            style={
              tratamientoSeleccionado
                ? styles.selectorTextActive
                : styles.selectorTextPlaceholder
            }
          >
            {tratamientoSeleccionado
              ? `🦷 ${tratamientoSeleccionado.nombre} (${tratamientoSeleccionado.duracion || 30} min)`
              : "Seleccionar tratamiento..."}
          </Text>
          <Text style={styles.selectorIcon}>▼</Text>
        </TouchableOpacity>

        <Text style={[styles.label, { marginTop: 16 }]}>Hora</Text>
        {!fecha ? (
          <Text style={styles.emptyText}>Ingresa primero una fecha.</Text>
        ) : horasDisponibles.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay horarios disponibles para esta fecha.
          </Text>
        ) : (
          <View style={styles.optionsContainer}>
            {horasDisponibles.map((horaDisponible) => (
              <TouchableOpacity
                key={horaDisponible}
                style={[
                  styles.optionButton,
                  hora === horaDisponible && styles.optionButtonSelected,
                ]}
                onPress={() => setHora(horaDisponible)}
              >
                <Text
                  style={[
                    styles.optionText,
                    hora === horaDisponible && styles.optionTextSelected,
                  ]}
                >
                  {formatearHora(horaDisponible)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleConfirmar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>SOLICITAR CITA</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={mostrarModalCalendario}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModalCalendario(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una Fecha</Text>
              <TouchableOpacity
                onPress={() => setMostrarModalCalendario(false)}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => cambiarMes(-1)}>
                <Text style={styles.calendarNavBtn}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {nombresMeses[mesActual]} {anioActual}
              </Text>
              <TouchableOpacity onPress={() => cambiarMes(1)}>
                <Text style={styles.calendarNavBtn}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d, idx) => (
                <Text key={idx} style={styles.weekDayText}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {diasDelMes.map((diaStr, idx) => {
                if (!diaStr) {
                  return (
                    <View key={`empty-${idx}`} style={styles.dayCellEmpty} />
                  );
                }
                const isSelected = fecha === diaStr;
                const isPast = diaStr < hoyStr;

                return (
                  <TouchableOpacity
                    key={diaStr}
                    disabled={isPast}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      isPast && styles.dayCellDisabled,
                    ]}
                    onPress={() => {
                      setFecha(diaStr);
                      setMostrarModalCalendario(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isSelected && styles.dayCellTextSelected,
                        isPast && styles.dayCellTextDisabled,
                      ]}
                    >
                      {Number(diaStr.split("-")[2])}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={mostrarModalTratamientos}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModalTratamientos(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un Tratamiento</Text>
              <TouchableOpacity
                onPress={() => setMostrarModalTratamientos(false)}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {listaTratamientos.map((tratamiento) => {
                const seleccionado =
                  tratamientoSeleccionado?.id_tratamiento ===
                  tratamiento.id_tratamiento;

                return (
                  <TouchableOpacity
                    key={tratamiento.id_tratamiento}
                    style={[
                      styles.treatmentOption,
                      seleccionado && styles.treatmentOptionSelected,
                    ]}
                    onPress={() => {
                      setTratamientoSeleccionado(tratamiento);
                      setMostrarModalTratamientos(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.treatmentName,
                        seleccionado && styles.treatmentNameSelected,
                      ]}
                    >
                      🦷 {tratamiento.nombre}
                    </Text>
                    {tratamiento.duracion ? (
                      <Text style={styles.treatmentDetail}>
                        Duración: {tratamiento.duracion} min
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
  branding: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoBox: {
    width: 56,
    height: 56,
    backgroundColor: "#0088FF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0088FF",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 22,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "700",
    marginBottom: 8,
  },
  selectorBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorTextPlaceholder: {
    fontSize: 14,
    color: "#64748B",
  },
  selectorTextActive: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  selectorIcon: {
    fontSize: 14,
    color: "#64748B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeModalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748B",
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calendarNavBtn: {
    fontSize: 16,
    color: "#0088FF",
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  calendarMonthText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  weekDaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    width: 32,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  dayCellEmpty: {
    width: "14.28%",
    height: 36,
  },
  dayCell: {
    width: "14.28%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: "#0088FF",
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  dayCellTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  dayCellTextDisabled: {
    color: "#94A3B8",
  },
  treatmentOption: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  treatmentOptionSelected: {
    borderColor: "#0088FF",
    backgroundColor: "#E0F2FE",
  },
  treatmentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  treatmentNameSelected: {
    color: "#0369A1",
  },
  treatmentDetail: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  optionButtonSelected: {
    backgroundColor: "#0088FF",
    borderColor: "#0088FF",
  },
  optionText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  successBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#0088FF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 22,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
