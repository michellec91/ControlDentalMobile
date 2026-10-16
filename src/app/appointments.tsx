import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function AppointmentsScreen() {
  const router = useRouter();

  const [usuarioNombre, setUsuarioNombre] = useState("Usuario");
  const [usuarioId, setUsuarioId] = useState<number | string | null>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal de confirmación
  const [citaACancelar, setCitaACancelar] = useState<number | string | null>(
    null,
  );
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);

  const API_CITAS = "http://localhost:3001/citas";

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, []),
  );

  const cargarDatos = async () => {
    setCargando(true);
    try {
      let uId: number | string | null = null;
      let uNombre = "Usuario";

      // 1. Extraer usuario autenticado de la sesión guardada en el navegador
      if (typeof window !== "undefined") {
        const sessionUser =
          localStorage.getItem("usuario") ||
          localStorage.getItem("user") ||
          sessionStorage.getItem("usuario") ||
          sessionStorage.getItem("user");

        if (sessionUser) {
          try {
            const parsed = JSON.parse(sessionUser);
            uId = parsed.id_usuario || parsed.id || parsed.usuario_id || null;
            uNombre =
              parsed.nombre ||
              parsed.nombre_completo ||
              parsed.username ||
              "Usuario";
          } catch (e) {}
        }
      }

      setUsuarioNombre(uNombre);
      setUsuarioId(uId);

      // 2. Si no hay ID de usuario activo en la sesión, la lista estará vacía
      if (!uId) {
        setCitas([]);
        setCargando(false);
        return;
      }

      // 3. Consultar a la API enviando id_usuario de forma estricta
      const resCitas = await fetch(`${API_CITAS}?id_usuario=${uId}`).catch(
        () => null,
      );

      if (resCitas && resCitas.ok) {
        const dataCitas = await resCitas.json();
        const lista = Array.isArray(dataCitas) ? dataCitas : [];
        const citasActivas = lista.filter((c) => c.estado !== "cancelada");
        setCitas(citasActivas);
      } else {
        setCitas([]);
      }
    } catch (err) {
      console.log("Error al cargar citas:", err);
      setCitas([]);
    } finally {
      setCargando(false);
    }
  };

  const solicitarConfirmacionCancelar = (id: number | string) => {
    setCitaACancelar(id);
  };

  const ejecutarCancelar = async () => {
    if (!citaACancelar) return;

    const id = citaACancelar;
    setCitaACancelar(null);

    try {
      const res = await fetch(`${API_CITAS}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMensaje({ tipo: "exito", texto: "Cita cancelada correctamente." });
        cargarDatos();
        setTimeout(() => setMensaje(null), 3000);
      } else {
        setMensaje({ tipo: "error", texto: "No se pudo cancelar la cita." });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (err) {
      setMensaje({
        tipo: "error",
        texto: "Error de conexión al cancelar la cita.",
      });
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Modal de Confirmación */}
      <Modal
        visible={citaACancelar !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCitaACancelar(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>¿Cancelar Cita?</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se
              puede deshacer.
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalBtnKeep}
                onPress={() => setCitaACancelar(null)}
              >
                <Text style={styles.modalBtnKeepText}>No, conservar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={ejecutarCancelar}
              >
                <Text style={styles.modalBtnConfirmText}>Sí, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Nav */}
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

      {/* Branding */}
      <View style={styles.branding}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🦷</Text>
        </View>
        <Text style={styles.brandTitle}>Control Dental</Text>
        <Text style={styles.brandSubtitle}>CLÍNICA DENTAL SONRISAS</Text>
      </View>

      {/* Tarjeta Principal */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Hola {usuarioNombre},</Text>
        <Text style={styles.sectionSubtitle}>
          {citas.length > 0
            ? "Tus citas agendadas:"
            : "Aquí está tu próxima cita:"}
        </Text>

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
            color="#0088FF"
            style={{ marginVertical: 20 }}
          />
        ) : citas.length > 0 ? (
          citas.map((cita, index) => {
            const fechaLimpia = (cita.fecha || cita.fecha_cita || "").split(
              "T",
            )[0];
            const horaLimpia = cita.hora || cita.hora_cita || "";
            const idCita = cita.id_cita || cita.id || index;

            return (
              <View key={idCita} style={styles.appointmentCard}>
                <View style={styles.dateHeader}>
                  <Text style={styles.calendarIcon}>📅</Text>
                  <Text style={styles.dateText}>
                    {fechaLimpia} {horaLimpia ? `- ${horaLimpia}` : ""}
                  </Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.label}>Tratamiento:</Text>
                <Text style={styles.valueText}>
                  🦷{" "}
                  {cita.tratamientoNombre ||
                    cita.tratamiento ||
                    cita.tratamiento_nombre ||
                    "Consulta Dental"}
                </Text>

                <Text style={styles.label}>Estado:</Text>
                <Text style={styles.statusConfirmed}>
                  ✓ {cita.estado || "confirmada"}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => solicitarConfirmacionCancelar(idCita)}
                  >
                    <Text style={styles.cancelBtnText}>🗑 Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/appointment/edit" as any,
                        params: {
                          id: idCita,
                          fecha: fechaLimpia,
                          hora: horaLimpia,
                          tratamiento:
                            cita.tratamientoNombre || cita.tratamiento,
                        },
                      })
                    }
                  >
                    <Text style={styles.editBtnText}>✏ Modificar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No tienes citas agendadas actualmente.
            </Text>
          </View>
        )}

        <Text style={styles.quickAccessLabel}>Accesos rápidos:</Text>
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push("/treatments" as any)}
          >
            <Text style={styles.quickBtnText}>🦷 Ver Tratamientos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.createMainBtn}
          onPress={() => router.push("/appointment/create" as any)}
        >
          <Text style={styles.createMainBtnText}>+ Agendar nueva cita</Text>
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
    marginBottom: 16,
  },
  logoBox: {
    width: 52,
    height: 52,
    backgroundColor: "#0088FF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0088FF",
    letterSpacing: 0.8,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 14,
    fontWeight: "500",
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
    backgroundColor: "#FEF9C3",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
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
    color: "#16A34A",
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  cancelBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
  },
  cancelBtnText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
  },
  editBtn: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyBox: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginTop: 6,
    marginBottom: 8,
  },
  quickAccessRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#94A3B8",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
  },
  createMainBtn: {
    borderWidth: 1,
    borderColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  createMainBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtnKeep: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 6,
  },
  modalBtnKeepText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 13,
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginLeft: 6,
  },
  modalBtnConfirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
