import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idCita = params.id;
  const hoyStr = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState((params.fecha as string) || "");
  const [hora, setHora] = useState((params.hora as string) || "");
  const [tratamientoSeleccionado, setTratamientoSeleccionado] =
    useState<any>(null);

  const [listaTratamientos, setListaTratamientos] = useState<any[]>([]);
  const [citasExistentes, setCitasExistentes] = useState<any[]>([]);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const API_CITAS = "http://localhost:3001/citas";
  const API_TRATAMIENTOS = "http://localhost:3001/tratamientos";

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Recalcular horarios según el día de la semana
  useEffect(() => {
    if (!fecha) {
      setHorasDisponibles([]);
      setHora("");
      return;
    }

    const fechaObj = new Date(`${fecha}T00:00:00`);
    const diaSemana = fechaObj.getDay();

    if (diaSemana === 0) {
      setError(
        "La clínica permanece cerrada los domingos. Por favor selecciona otra fecha.",
      );
      setHorasDisponibles([]);
      setHora("");
      return;
    }

    setError("");

    const horasSemana = [
      "08:00 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "01:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
      "05:00 PM",
    ];

    const horasSabado = [
      "08:00 AM",
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
    ];

    if (diaSemana === 6) {
      setHorasDisponibles(horasSabado);
    } else {
      setHorasDisponibles(horasSemana);
    }
  }, [fecha]);

  const cargarDatosIniciales = async () => {
    try {
      // 1. Cargar tratamientos
      const resTrat = await fetch(API_TRATAMIENTOS);
      if (resTrat.ok) {
        const dataTrat = await resTrat.json();
        const lista = Array.isArray(dataTrat) ? dataTrat : [];
        setListaTratamientos(lista);

        // Preseleccionar el tratamiento recibido en los parámetros
        if (params.tratamiento && lista.length > 0) {
          const encontrado = lista.find((t) => {
            const nombre = t.nombre_tratamiento || t.nombre || t.name;
            return nombre === params.tratamiento;
          });
          if (encontrado) setTratamientoSeleccionado(encontrado);
        }
      }

      // 2. Cargar citas para validación
      const resCitas = await fetch(API_CITAS);
      if (resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitasExistentes(Array.isArray(dataCitas) ? dataCitas : []);
      }
    } catch (err) {
      console.log("Error al cargar datos de edición:", err);
    }
  };

  const handleActualizar = async () => {
    setError("");
    setExito("");

    if (!fecha) {
      setError("Por favor selecciona una fecha.");
      return;
    }

    if (!hora) {
      setError("Por favor selecciona un horario disponible.");
      return;
    }

    if (!tratamientoSeleccionado) {
      setError("Por favor selecciona un tratamiento.");
      return;
    }

    if (fecha < hoyStr) {
      setError("No puedes agendar una cita para una fecha pasada.");
      return;
    }

    // Validación de duplicado omitiendo la misma cita
    const duplicado = citasExistentes.some((c) => {
      const idC = c.id_cita || c.id;
      const cFecha = (c.fecha || c.fecha_cita || "").split("T")[0];
      const cHora = c.hora || c.hora_cita || "";
      return (
        String(idC) !== String(idCita) &&
        cFecha === fecha &&
        cHora === hora &&
        c.estado !== "cancelada"
      );
    });

    if (duplicado) {
      setError(
        "Ese horario ya está ocupado. Por favor selecciona otra fecha u hora.",
      );
      return;
    }

    setCargando(true);

    const tratamiento_id =
      tratamientoSeleccionado.id_tratamiento || tratamientoSeleccionado.id || 1;

    const payload = {
      tratamiento_id,
      fecha,
      hora,
      estado: "confirmada",
    };

    try {
      const res = await fetch(`${API_CITAS}/${idCita}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setExito("¡Cita modificada con éxito!");
        setTimeout(() => {
          router.push("/appointments" as any);
        }, 1200);
      } else {
        setError(resData.mensaje || "Ocurrió un error al actualizar la cita.");
      }
    } catch (err) {
      setError("Error de conexión al guardar los cambios.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado Nav Superior */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.iconGroup}>
          <TouchableOpacity
            onPress={() => router.push("/home" as any)}
            style={styles.iconBtn}
          >
            <Text style={styles.iconText}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/profile" as any)}
            style={styles.iconBtn}
          >
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Marca / Branding */}
      <View style={styles.branding}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🦷</Text>
        </View>
        <Text style={styles.brandTitle}>Control Dental</Text>
        <Text style={styles.brandSubtitle}>CLÍNICA DENTAL SONRISAS</Text>
      </View>

      {/* Tarjeta de Formulario */}
      <View style={styles.card}>
        <Text style={styles.title}>Modificar cita</Text>
        <Text style={styles.subtitle}>Ver fechas disponibles:</Text>

        {/* Mensaje de Error Integrado */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Mensaje de Éxito Integrado */}
        {exito ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {exito}</Text>
          </View>
        ) : null}

        {/* 1. Selector de Fecha */}
        <View style={styles.inputContainer}>
          <input
            type="date"
            min={hoyStr}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1E293B",
              cursor: "pointer",
            }}
          />
        </View>

        {/* 2. Selector de Hora */}
        <View style={styles.inputContainer}>
          <select
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            disabled={horasDisponibles.length === 0}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1E293B",
              cursor: horasDisponibles.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            <option value="">
              {horasDisponibles.length === 0
                ? "-- Selecciona una fecha válida primero --"
                : "-- Seleccionar hora --"}
            </option>
            {horasDisponibles.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </View>

        {/* 3. Selector de Tratamiento */}
        <View style={styles.inputContainer}>
          <select
            value={
              tratamientoSeleccionado
                ? JSON.stringify(tratamientoSeleccionado)
                : ""
            }
            onChange={(e) =>
              setTratamientoSeleccionado(
                e.target.value ? JSON.parse(e.target.value) : null,
              )
            }
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              fontSize: "14px",
              fontWeight: "500",
              color: "#1E293B",
              cursor: "pointer",
            }}
          >
            <option value="">-- Seleccionar tratamiento --</option>
            {listaTratamientos.map((t, idx) => {
              const nombre = t.nombre_tratamiento || t.nombre || t.name;
              return (
                <option
                  key={t.id_tratamiento || t.id || idx}
                  value={JSON.stringify(t)}
                >
                  {nombre}
                </option>
              );
            })}
          </select>
        </View>

        {/* Acciones */}
        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleActualizar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>CONFIRMAR CAMBIOS</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelLinkText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },
  headerNav: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  iconGroup: {
    flexDirection: "row",
  },
  iconBtn: {
    marginLeft: 12,
    padding: 4,
  },
  iconText: {
    fontSize: 18,
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
  logoIcon: {
    fontSize: 28,
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
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  inputContainer: {
    backgroundColor: "#FEF9C3",
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0088FF",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
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
  cancelLink: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 6,
  },
  cancelLinkText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
