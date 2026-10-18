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

export default function CreateAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const hoyStr = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [tratamientoSeleccionado, setTratamientoSeleccionado] =
    useState<any>(null);
  const [usuarioObj, setUsuarioObj] = useState<any>(null);

  const [listaTratamientos, setListaTratamientos] = useState<any[]>([
    { id_tratamiento: 1, nombre: "Odontología preventiva" },
    { id_tratamiento: 2, nombre: "Ortodoncia" },
    { id_tratamiento: 3, nombre: "Limpieza dental profunda" },
    { id_tratamiento: 4, nombre: "Evaluación/Consulta Dental" },
  ]);
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
      // 1. Cargar usuario de sesión activa
      if (typeof window !== "undefined") {
        const sessionUser =
          localStorage.getItem("usuario") ||
          localStorage.getItem("user") ||
          sessionStorage.getItem("usuario") ||
          sessionStorage.getItem("user");

        if (sessionUser) {
          try {
            const parsed = JSON.parse(sessionUser);
            setUsuarioObj(parsed);
          } catch (e) {}
        }
      }

      // 2. Cargar citas para validaciones
      const resCitas = await fetch(API_CITAS).catch(() => null);
      if (resCitas && resCitas.ok) {
        const dataCitas = await resCitas.json();
        setCitasExistentes(Array.isArray(dataCitas) ? dataCitas : []);
      }

      // 3. Cargar tratamientos y preseleccionar el enviado desde treatments.tsx
      const resTratamientos = await fetch(API_TRATAMIENTOS).catch(() => null);
      let lista = listaTratamientos;
      if (resTratamientos && resTratamientos.ok) {
        const dataTrat = await resTratamientos.json();
        if (Array.isArray(dataTrat) && dataTrat.length > 0) {
          lista = dataTrat;
          setListaTratamientos(lista);
        }
      }

      // Preseleccionar tratamiento recibido en params
      const paramTratamiento =
        params.treatmentId || params.id_tratamiento || params.tratamiento;
      if (paramTratamiento && lista.length > 0) {
        const encontrado = lista.find((t) => {
          const nombreT = t.nombre || t.nombre_tratamiento || t.name;
          const idT = t.id_tratamiento || t.id;
          return (
            String(idT) === String(paramTratamiento) ||
            nombreT === paramTratamiento
          );
        });

        if (encontrado) {
          setTratamientoSeleccionado(encontrado);
        }
      }
    } catch (err) {
      console.log("Error al cargar datos iniciales:", err);
    }
  };

  const handleConfirmar = async () => {
    setError("");
    setExito("");

    if (!usuarioObj) {
      setError("Debes iniciar sesión para agendar una cita.");
      return;
    }

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

    const citaDuplicada = citasExistentes.some((cita) => {
      const citaFecha = (cita.fecha || cita.fecha_cita || "").split("T")[0];
      const citaHora = cita.hora || cita.hora_cita || "";
      return (
        citaFecha === fecha && citaHora === hora && cita.estado !== "cancelada"
      );
    });

    if (citaDuplicada) {
      setError(
        "Ese horario ya está ocupado en la clínica. Por favor selecciona otra fecha u hora.",
      );
      return;
    }

    setCargando(true);

    const uId = usuarioObj.id_usuario || usuarioObj.id || usuarioObj.usuario_id;
    const tratamiento_id =
      tratamientoSeleccionado.id_tratamiento || tratamientoSeleccionado.id || 1;

    const payload = {
      usuario_id: uId,
      id_usuario: uId,
      tratamiento_id,
      id_tratamiento: tratamiento_id,
      fecha,
      hora,
      estado: "confirmada",
    };

    try {
      const res = await fetch(API_CITAS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok) {
        setExito("¡Cita agendada con éxito!");
        setTimeout(() => {
          router.push("/appointments" as any);
        }, 1200);
      } else {
        setError(resData.mensaje || "Ocurrió un error al guardar la cita.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <View style={styles.branding}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🦷</Text>
        </View>
        <Text style={styles.brandTitle}>Control Dental</Text>
        <Text style={styles.brandSubtitle}>CLÍNICA DENTAL SONRISAS</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Nueva cita</Text>
        <Text style={styles.subtitle}>Ver fechas disponibles:</Text>

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
              const nombreTratamiento =
                t.nombre ||
                t.nombre_tratamiento ||
                t.name ||
                `Tratamiento ${idx + 1}`;
              return (
                <option
                  key={t.id_tratamiento || t.id || idx}
                  value={JSON.stringify(t)}
                >
                  {nombreTratamiento}
                </option>
              );
            })}
          </select>
        </View>

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleConfirmar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>CONFIRMAR</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F0F9FF", // Fondo celeste unificado
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
});
