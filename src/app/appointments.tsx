import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import {
  useCallback,
  useState,
} from "react";

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
  obtenerCitasPorUsuario,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

interface Cita {
  id_cita: number;

  id_usuario: number;

  paciente_nombre?: string;
  paciente_apellido?: string;

  id_tratamiento: number;
  tratamiento_nombre: string;

  fecha: string;
  hora: string;
  estado: string;
}

export default function AppointmentsScreen() {
  const router = useRouter();

  const { usuario } =
    useAuth();

  const [
    citas,
    setCitas,
  ] =
    useState<Cita[]>([]);

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    citaACancelar,
    setCitaACancelar,
  ] =
    useState<number | null>(
      null
    );

  const [
    mensaje,
    setMensaje,
  ] =
    useState<{
      tipo:
        | "exito"
        | "error";
      texto: string;
    } | null>(null);

  // -----------------------------------------
  // CARGAR CITAS
  // -----------------------------------------
  const cargarDatos =
    useCallback(
      async () => {
        setCargando(true);

        try {
          if (!usuario) {
            setCitas([]);

            setMensaje({
              tipo: "error",
              texto:
                "Debes iniciar sesión para ver tus citas.",
            });

            return;
          }

          const idUsuario =
            usuario.id_usuario;

          if (!idUsuario) {
            setCitas([]);

            setMensaje({
              tipo: "error",
              texto:
                "No fue posible identificar al usuario.",
            });

            return;
          }

          const data =
            await obtenerCitasPorUsuario(
              idUsuario
            );

          const lista =
            Array.isArray(
              data
            )
              ? data
              : [];

          // No mostrar citas canceladas.
          const citasVisibles =
            lista.filter(
              (
                cita: Cita
              ) =>
                cita.estado
                  ?.toLowerCase()
                  .trim() !==
                "cancelada"
            );

          // Ordenar por fecha y hora.
          citasVisibles.sort(
            (
              a: Cita,
              b: Cita
            ) => {
              const fechaA =
                `${a.fecha
                  .split("T")[0]}T${a.hora}`;

              const fechaB =
                `${b.fecha
                  .split("T")[0]}T${b.hora}`;

              return (
                new Date(
                  fechaA
                ).getTime() -
                new Date(
                  fechaB
                ).getTime()
              );
            }
          );

          setCitas(
            citasVisibles
          );

          setMensaje(null);
        } catch (error) {
          console.error(
            "Error al cargar citas:",
            error
          );

          setCitas([]);

          setMensaje({
            tipo: "error",

            texto:
              error instanceof
              Error
                ? error.message
                : "No fue posible cargar tus citas.",
          });
        } finally {
          setCargando(false);
        }
      },
      [usuario]
    );

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  // -----------------------------------------
  // CANCELAR
  // -----------------------------------------
  const solicitarConfirmacionCancelar =
    (id: number) => {
      setCitaACancelar(id);
    };

  const ejecutarCancelar =
    async () => {
      if (
        citaACancelar ===
        null
      ) {
        return;
      }

      const id =
        citaACancelar;

      setCitaACancelar(
        null
      );

      try {
        const res =
          await fetch(
            `${API_URL}/citas/${id}/estado`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  estado:
                    "Cancelada",
                }),
            }
          );

        const data =
          await res
            .json()
            .catch(
              () => ({})
            );

        if (!res.ok) {
          throw new Error(
            data.error ||
              "No se pudo cancelar la cita."
          );
        }

        setMensaje({
          tipo: "exito",
          texto:
            "Cita cancelada correctamente.",
        });

        await cargarDatos();

        setTimeout(
          () =>
            setMensaje(
              null
            ),
          3000
        );
      } catch (error) {
        console.error(
          "Error al cancelar cita:",
          error
        );

        setMensaje({
          tipo: "error",

          texto:
            error instanceof Error
              ? error.message
              : "Error de conexión al cancelar la cita.",
        });
      }
    };

  // -----------------------------------------
  // FECHA
  // -----------------------------------------
  const formatearFecha =
    (fecha: string) => {
      if (!fecha) {
        return "-";
      }

      const fechaLimpia =
        fecha.includes("T")
          ? fecha.split("T")[0]
          : fecha;

      return new Date(
        `${fechaLimpia}T00:00:00`
      ).toLocaleDateString(
        "es-ES",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );
    };

  // -----------------------------------------
  // HORA
  // -----------------------------------------
  const formatearHora =
    (hora: string) => {
      if (!hora) {
        return "-";
      }

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

  // -----------------------------------------
  // ESTADO
  // -----------------------------------------
  const formatearEstado =
    (estado: string) => {
      const valor =
        estado
          ?.toLowerCase()
          .trim();

      if (
        valor ===
        "pendiente"
      ) {
        return "Pendiente";
      }

      if (
        valor ===
        "confirmada"
      ) {
        return "Confirmada";
      }

      if (
        valor ===
        "completada"
      ) {
        return "Completada";
      }

      if (
        valor ===
        "cancelada"
      ) {
        return "Cancelada";
      }

      return estado || "-";
    };

  const obtenerEstiloEstado =
    (estado: string) => {
      const valor =
        estado
          ?.toLowerCase()
          .trim();

      if (
        valor ===
        "pendiente"
      ) {
        return styles.statusPending;
      }

      if (
        valor ===
        "confirmada"
      ) {
        return styles.statusConfirmed;
      }

      if (
        valor ===
        "completada"
      ) {
        return styles.statusCompleted;
      }

      return styles.statusDefault;
    };

  const nombreCompleto =
    usuario
      ? [
          usuario.nombre,
          usuario.apellido,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
      : "Usuario";

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      {/* MODAL */}
      <Modal
        visible={
          citaACancelar !==
          null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCitaACancelar(
            null
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalCard
            }
          >
            <Text
              style={
                styles.modalIcon
              }
            >
              ⚠️
            </Text>

            <Text
              style={
                styles.modalTitle
              }
            >
              ¿Cancelar cita?
            </Text>

            <Text
              style={
                styles.modalText
              }
            >
              ¿Estás seguro de
              que deseas cancelar
              esta cita?
            </Text>

            <View
              style={
                styles.modalActionRow
              }
            >
              <TouchableOpacity
                style={
                  styles.modalBtnKeep
                }
                onPress={() =>
                  setCitaACancelar(
                    null
                  )
                }
              >
                <Text
                  style={
                    styles.modalBtnKeepText
                  }
                >
                  No, conservar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.modalBtnConfirm
                }
                onPress={
                  ejecutarCancelar
                }
              >
                <Text
                  style={
                    styles.modalBtnConfirmText
                  }
                >
                  Sí, cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NAVEGACIÓN */}
      <View
        style={
          styles.headerNav
        }
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backText
            }
          >
            ← Volver
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.iconGroup
          }
        >
          <TouchableOpacity
            onPress={() =>
              router.push(
                "/home"
              )
            }
          >
            <Text
              style={
                styles.iconText
              }
            >
              🏠
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push(
                "/profile"
              )
            }
          >
            <Text
              style={[
                styles.iconText,
                {
                  marginLeft: 15,
                },
              ]}
            >
              👤
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MARCA */}
      <View
        style={
          styles.branding
        }
      >
        <View
          style={
            styles.logoBox
          }
        >
          <Text
            style={
              styles.logoIcon
            }
          >
            🦷
          </Text>
        </View>

        <Text
          style={
            styles.brandTitle
          }
        >
          Control Dental
        </Text>

        <Text
          style={
            styles.brandSubtitle
          }
        >
          CLÍNICA DENTAL SONRISAS
        </Text>
      </View>

      <View
        style={styles.card}
      >
        <Text
          style={
            styles.welcomeText
          }
        >
          Hola{" "}
          {nombreCompleto},
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {citas.length > 0
            ? "Tus citas:"
            : "Aquí aparecerán tus citas."}
        </Text>

        {/* MENSAJES */}
        {mensaje ? (
          <View
            style={
              mensaje.tipo ===
              "exito"
                ? styles.successBox
                : styles.errorBox
            }
          >
            <Text
              style={
                mensaje.tipo ===
                "exito"
                  ? styles.successText
                  : styles.errorText
              }
            >
              {mensaje.tipo ===
              "exito"
                ? "✓ "
                : "⚠️ "}
              {mensaje.texto}
            </Text>
          </View>
        ) : null}

        {/* CITAS */}
        {cargando ? (
          <ActivityIndicator
            size="large"
            color="#0088FF"
            style={{
              marginVertical:
                20,
            }}
          />
        ) : citas.length >
          0 ? (
          citas.map(
            (cita) => {
              const estado =
                cita.estado
                  ?.toLowerCase()
                  .trim();

              const puedeModificar =
                estado ===
                  "pendiente" ||
                estado ===
                  "confirmada";

              return (
                <View
                  key={
                    cita.id_cita
                  }
                  style={
                    styles.appointmentCard
                  }
                >
                  <View
                    style={
                      styles.dateHeader
                    }
                  >
                    <Text
                      style={
                        styles.calendarIcon
                      }
                    >
                      📅
                    </Text>

                    <Text
                      style={
                        styles.dateText
                      }
                    >
                      {formatearFecha(
                        cita.fecha
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.hourText
                    }
                  >
                    🕒{" "}
                    {formatearHora(
                      cita.hora
                    )}
                  </Text>

                  <View
                    style={
                      styles.divider
                    }
                  />

                  <Text
                    style={
                      styles.label
                    }
                  >
                    Tratamiento:
                  </Text>

                  <Text
                    style={
                      styles.valueText
                    }
                  >
                    🦷{" "}
                    {cita.tratamiento_nombre ||
                      "Tratamiento no disponible"}
                  </Text>

                  <Text
                    style={
                      styles.label
                    }
                  >
                    Estado:
                  </Text>

                  <Text
                    style={obtenerEstiloEstado(
                      cita.estado
                    )}
                  >
                    {estado ===
                    "pendiente"
                      ? "⏳ "
                      : estado ===
                          "confirmada"
                        ? "✓ "
                        : estado ===
                            "completada"
                          ? "✓ "
                          : ""}

                    {formatearEstado(
                      cita.estado
                    )}
                  </Text>

                  {puedeModificar && (
                    <View
                      style={
                        styles.actionRow
                      }
                    >
                      <TouchableOpacity
                        style={
                          styles.cancelBtn
                        }
                        onPress={() =>
                          solicitarConfirmacionCancelar(
                            cita.id_cita
                          )
                        }
                      >
                        <Text
                          style={
                            styles.cancelBtnText
                          }
                        >
                          🗑 Cancelar
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={
                          styles.editBtn
                        }
                        onPress={() =>
                          router.push({
                            pathname:
                              "/appointment/edit",

                            params: {
                              id: String(
                                cita.id_cita
                              ),

                              fecha:
                                cita.fecha.split(
                                  "T"
                                )[0],

                              hora:
                                cita.hora.slice(
                                  0,
                                  5
                                ),

                              id_tratamiento:
                                String(
                                  cita.id_tratamiento
                                ),

                              tratamiento:
                                cita.tratamiento_nombre,

                              estado:
                                cita.estado,
                            },
                          })
                        }
                      >
                        <Text
                          style={
                            styles.editBtnText
                          }
                        >
                          ✏ Modificar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }
          )
        ) : (
          <View
            style={
              styles.emptyBox
            }
          >
            <Text
              style={
                styles.emptyText
              }
            >
              No tienes citas actualmente.
            </Text>
          </View>
        )}

        {/* ACCESOS */}
        <Text
          style={
            styles.quickAccessLabel
          }
        >
          Accesos rápidos:
        </Text>

        <TouchableOpacity
          style={
            styles.quickBtn
          }
          onPress={() =>
            router.push(
              "/treatments"
            )
          }
        >
          <Text
            style={
              styles.quickBtnText
            }
          >
            🦷 Ver tratamientos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.createMainBtn
          }
          onPress={() =>
            router.push(
              "/appointment/create"
            )
          }
        >
          <Text
            style={
              styles.createMainBtnText
            }
          >
            + Solicitar nueva cita
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor:
        "#F0F9FF",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
      alignItems: "center",
    },

    headerNav: {
      width: "100%",
      maxWidth: 430,
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 16,
    },

    backText: {
      fontSize: 15,
      fontWeight: "600",
      color: "#1E293B",
    },

    iconGroup: {
      flexDirection: "row",
      alignItems: "center",
    },

    iconText: {
      fontSize: 20,
    },

    branding: {
      alignItems: "center",
      marginBottom: 16,
    },

    logoBox: {
      width: 52,
      height: 52,
      backgroundColor:
        "#0088FF",
      borderRadius: 16,
      justifyContent:
        "center",
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
      maxWidth: 430,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      padding: 20,
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
      backgroundColor:
        "#FEE2E2",
      borderWidth: 1,
      borderColor:
        "#FCA5A5",
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
      backgroundColor:
        "#DCFCE7",
      borderWidth: 1,
      borderColor:
        "#86EFAC",
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
        "#FEF9C3",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
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
      backgroundColor:
        "#CBD5E1",
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

    statusPending: {
      fontSize: 13,
      fontWeight: "700",
      color: "#D97706",
      marginBottom: 12,
    },

    statusConfirmed: {
      fontSize: 13,
      fontWeight: "700",
      color: "#2563EB",
      marginBottom: 12,
    },

    statusCompleted: {
      fontSize: 13,
      fontWeight: "700",
      color: "#16A34A",
      marginBottom: 12,
    },

    statusDefault: {
      fontSize: 13,
      fontWeight: "700",
      color: "#475569",
      marginBottom: 12,
    },

    actionRow: {
      flexDirection: "row",
      justifyContent:
        "flex-end",
      marginTop: 4,
    },

    cancelBtn: {
      backgroundColor:
        "#FEE2E2",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      marginRight: 8,
    },

    cancelBtnText: {
      color: "#DC2626",
      fontSize: 11,
      fontWeight: "700",
    },

    editBtn: {
      backgroundColor:
        "#E0F2FE",
      paddingHorizontal: 12,
      paddingVertical: 7,
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

    quickBtn: {
      borderWidth: 1,
      borderColor:
        "#94A3B8",
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: "center",
      marginBottom: 14,
    },

    quickBtnText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#1E293B",
    },

    createMainBtn: {
      borderWidth: 1,
      borderColor:
        "#0F172A",
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
      backgroundColor:
        "rgba(15, 23, 42, 0.5)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    modalCard: {
      width: "100%",
      maxWidth: 340,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 22,
      alignItems: "center",
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
      width: "100%",
    },

    modalBtnKeep: {
      flex: 1,
      backgroundColor:
        "#F1F5F9",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
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
      backgroundColor:
        "#DC2626",
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