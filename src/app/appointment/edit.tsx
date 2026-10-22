import {
  useLocalSearchParams,
  useRouter,
} from "expo-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  API_URL,
  obtenerHorarios,
  obtenerTratamientos,
} from "../../services/api";

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

export default function EditAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idCita =
    Number(params.id);

  const hoy =
    new Date();

  const hoyStr =
    `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}-${String(
      hoy.getDate()
    ).padStart(2, "0")}`;

  const [
    fecha,
    setFecha,
  ] = useState(
    String(
      params.fecha || ""
    ).split("T")[0]
  );

  const [
    hora,
    setHora,
  ] = useState(
    String(
      params.hora || ""
    ).slice(0, 5)
  );

  const [
    tratamientoSeleccionado,
    setTratamientoSeleccionado,
  ] =
    useState<Tratamiento | null>(
      null
    );

  const [
    listaTratamientos,
    setListaTratamientos,
  ] =
    useState<Tratamiento[]>([]);

  const [
    citasExistentes,
    setCitasExistentes,
  ] =
    useState<Cita[]>([]);

  const [
    horarios,
    setHorarios,
  ] =
    useState<Horario[]>([]);

  const [
    error,
    setError,
  ] = useState("");

  const [
    exito,
    setExito,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    cargandoDatos,
    setCargandoDatos,
  ] = useState(true);

  // -----------------------------------------
  // CARGAR DATOS
  // -----------------------------------------
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales =
    async () => {
      try {
        setCargandoDatos(true);
        setError("");

        // -------------------------------------
        // TRATAMIENTOS
        // -------------------------------------
        const dataTratamientos =
          await obtenerTratamientos();

        const tratamientosActivos =
          Array.isArray(
            dataTratamientos
          )
            ? dataTratamientos.filter(
                (
                  tratamiento: Tratamiento
                ) =>
                  !tratamiento.estado ||
                  tratamiento.estado
                    .toLowerCase()
                    .trim() ===
                    "activo"
              )
            : [];

        setListaTratamientos(
          tratamientosActivos
        );

        // -------------------------------------
        // TRATAMIENTO ACTUAL
        // -------------------------------------
        const idTratamientoActual =
          Number(
            params.id_tratamiento
          );

        if (
          idTratamientoActual &&
          tratamientosActivos.length >
            0
        ) {
          const encontrado =
            tratamientosActivos.find(
              (
                tratamiento: Tratamiento
              ) =>
                tratamiento.id_tratamiento ===
                idTratamientoActual
            );

          if (encontrado) {
            setTratamientoSeleccionado(
              encontrado
            );
          }
        }

        // -------------------------------------
        // CITAS
        // -------------------------------------
        const resCitas =
          await fetch(
            `${API_URL}/citas`
          );

        const dataCitas =
          await resCitas
            .json()
            .catch(
              () => []
            );

        if (!resCitas.ok) {
          throw new Error(
            dataCitas?.error ||
              "No se pudieron obtener las citas."
          );
        }

        setCitasExistentes(
          Array.isArray(
            dataCitas
          )
            ? dataCitas
            : []
        );

        // -------------------------------------
        // HORARIOS
        // -------------------------------------
        const dataHorarios =
          await obtenerHorarios();

        const horariosActivos =
          Array.isArray(
            dataHorarios
          )
            ? dataHorarios.filter(
                (
                  horario: Horario
                ) =>
                  !horario.estado ||
                  horario.estado
                    .toLowerCase()
                    .trim() ===
                    "activo"
              )
            : [];

        setHorarios(
          horariosActivos
        );
      } catch (error) {
        console.error(
          "Error al cargar datos de edición:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los datos."
        );
      } finally {
        setCargandoDatos(
          false
        );
      }
    };

  // -----------------------------------------
  // NORMALIZAR TEXTO
  // -----------------------------------------
  const normalizarTexto =
    (texto: string) =>
      texto
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        )
        .toLowerCase()
        .trim();

  // -----------------------------------------
  // OBTENER DÍA
  // -----------------------------------------
  const obtenerNombreDia =
    (
      fechaSeleccionada: string
    ) => {
      if (
        !fechaSeleccionada
      ) {
        return "";
      }

      const fechaObj =
        new Date(
          `${fechaSeleccionada}T00:00:00`
        );

      const dias = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
      ];

      return dias[
        fechaObj.getDay()
      ];
    };

  // -----------------------------------------
  // GENERAR HORAS
  // -----------------------------------------
  const generarHoras =
    (
      horaInicio: string,
      horaFin: string
    ) => {
      const resultado: string[] =
        [];

      const [
        horaInicioNumero,
        minutoInicio,
      ] =
        horaInicio
          .slice(0, 5)
          .split(":")
          .map(Number);

      const [
        horaFinNumero,
        minutoFin,
      ] =
        horaFin
          .slice(0, 5)
          .split(":")
          .map(Number);

      let minutosActuales =
        horaInicioNumero *
          60 +
        minutoInicio;

      const minutosFinales =
        horaFinNumero *
          60 +
        minutoFin;

      while (
        minutosActuales <=
        minutosFinales
      ) {
        const horas =
          Math.floor(
            minutosActuales /
              60
          );

        const minutos =
          minutosActuales %
          60;

        resultado.push(
          `${String(
            horas
          ).padStart(
            2,
            "0"
          )}:${String(
            minutos
          ).padStart(
            2,
            "0"
          )}`
        );

        minutosActuales +=
          60;
      }

      return resultado;
    };

  // -----------------------------------------
  // HORAS DISPONIBLES
  // -----------------------------------------
  const horasDisponibles =
    useMemo(() => {
      if (!fecha) {
        return [];
      }

      const nombreDia =
        obtenerNombreDia(
          fecha
        );

      if (
        nombreDia ===
        "domingo"
      ) {
        return [];
      }

      const horarioDia =
        horarios.find(
          (
            horario
          ) =>
            normalizarTexto(
              horario.dia_semana
            ) ===
            normalizarTexto(
              nombreDia
            )
        );

      if (!horarioDia) {
        return [];
      }

      const todasLasHoras =
        generarHoras(
          horarioDia.hora_inicio,
          horarioDia.hora_fin
        );

      return todasLasHoras.filter(
        (
          horaDisponible
        ) => {
          const horaBD =
            `${horaDisponible}:00`;

          const ocupada =
            citasExistentes.some(
              (
                cita
              ) => {
                // No comparar la cita que estamos editando.
                if (
                  cita.id_cita ===
                  idCita
                ) {
                  return false;
                }

                const fechaCita =
                  cita.fecha?.includes(
                    "T"
                  )
                    ? cita.fecha.split(
                        "T"
                      )[0]
                    : cita.fecha;

                const horaCita =
                  cita.hora?.slice(
                    0,
                    8
                  );

                const estado =
                  cita.estado
                    ?.toLowerCase()
                    .trim();

                return (
                  fechaCita ===
                    fecha &&
                  horaCita ===
                    horaBD &&
                  estado !==
                    "cancelada"
                );
              }
            );

          return !ocupada;
        }
      );
    }, [
      fecha,
      horarios,
      citasExistentes,
      idCita,
    ]);

  // -----------------------------------------
  // FORMATEAR HORA
  // -----------------------------------------
  const formatearHora =
    (
      hora24: string
    ) => {
      const [
        horas,
        minutos,
      ] =
        hora24
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
  // CAMBIAR FECHA
  // -----------------------------------------
  const handleCambiarFecha =
    (
      nuevaFecha: string
    ) => {
      setFecha(
        nuevaFecha
      );

      // Si cambia la fecha,
      // el usuario debe escoger
      // nuevamente una hora.
      setHora("");

      setError("");
      setExito("");
    };

  // -----------------------------------------
  // ACTUALIZAR CITA
  // -----------------------------------------
  const handleActualizar =
    async () => {
      setError("");
      setExito("");

      if (
        !idCita ||
        Number.isNaN(
          idCita
        )
      ) {
        setError(
          "No fue posible identificar la cita."
        );

        return;
      }

      if (!fecha) {
        setError(
          "Por favor ingresa una fecha."
        );

        return;
      }

      const formatoFecha =
        /^\d{4}-\d{2}-\d{2}$/;

      if (
        !formatoFecha.test(
          fecha
        )
      ) {
        setError(
          "La fecha debe escribirse en formato AAAA-MM-DD."
        );

        return;
      }

      if (
        fecha <
        hoyStr
      ) {
        setError(
          "No puedes seleccionar una fecha pasada."
        );

        return;
      }

      const nombreDia =
        obtenerNombreDia(
          fecha
        );

      if (
        nombreDia ===
        "domingo"
      ) {
        setError(
          "La clínica permanece cerrada los domingos."
        );

        return;
      }

      const horarioExiste =
        horarios.some(
          (
            horario
          ) =>
            normalizarTexto(
              horario.dia_semana
            ) ===
            normalizarTexto(
              nombreDia
            )
        );

      if (
        !horarioExiste
      ) {
        setError(
          "La clínica no posee un horario activo para ese día."
        );

        return;
      }

      if (!hora) {
        setError(
          "Por favor selecciona una hora."
        );

        return;
      }

      if (
        !horasDisponibles.includes(
          hora
        )
      ) {
        setError(
          "El horario seleccionado ya no está disponible."
        );

        return;
      }

      if (
        !tratamientoSeleccionado
      ) {
        setError(
          "Por favor selecciona un tratamiento."
        );

        return;
      }

      const horaBD =
        `${hora}:00`;

      try {
        setCargando(true);

        const payload = {
          id_tratamiento:
            tratamientoSeleccionado.id_tratamiento,

          fecha,

          hora:
            horaBD,

          // IMPORTANTE:
          // Cualquier cambio realizado
          // por el paciente debe volver
          // a revisión administrativa.
          estado:
            "Pendiente",
        };

        const res =
          await fetch(
            `${API_URL}/citas/${idCita}`,
            {
              method:
                "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  payload
                ),
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
              data.mensaje ||
              "No se pudo modificar la cita."
          );
        }

        setExito(
          "¡Cita modificada correctamente! Quedará pendiente de confirmación."
        );

        setTimeout(
          () => {
            router.replace(
              "/appointments" as any
            );
          },
          1200
        );
      } catch (error) {
        console.error(
          "Error al actualizar cita:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Error de conexión al guardar los cambios."
        );
      } finally {
        setCargando(false);
      }
    };

  // -----------------------------------------
  // CARGANDO
  // -----------------------------------------
  if (
    cargandoDatos
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color="#0088FF"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Cargando cita...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
      keyboardShouldPersistTaps="handled"
    >
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
                "/home" as any
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
                "/profile" as any
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

      {/* BRANDING */}
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

      {/* TARJETA */}
      <View
        style={
          styles.card
        }
      >
        <Text
          style={
            styles.title
          }
        >
          Modificar cita
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Cambia la fecha,
          hora o tratamiento
        </Text>

        <View
          style={
            styles.infoBox
          }
        >
          <Text
            style={
              styles.infoText
            }
          >
            ℹ️ Al modificar la cita,
            esta volverá a estado
            Pendiente para que la
            clínica confirme el nuevo horario.
          </Text>
        </View>

        {/* ERROR */}
        {error ? (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorText
              }
            >
              ⚠️ {error}
            </Text>
          </View>
        ) : null}

        {/* ÉXITO */}
        {exito ? (
          <View
            style={
              styles.successBox
            }
          >
            <Text
              style={
                styles.successText
              }
            >
              ✓ {exito}
            </Text>
          </View>
        ) : null}

        {/* FECHA */}
        <Text
          style={
            styles.label
          }
        >
          Fecha
        </Text>

        <TextInput
          value={fecha}
          onChangeText={
            handleCambiarFecha
          }
          placeholder="AAAA-MM-DD"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          style={
            styles.input
          }
        />

        <Text
          style={
            styles.helperText
          }
        >
          Ejemplo: 2026-10-25
        </Text>

        {/* HORA */}
        <Text
          style={
            styles.label
          }
        >
          Hora
        </Text>

        {!fecha ? (
          <Text
            style={
              styles.emptyText
            }
          >
            Ingresa primero una fecha.
          </Text>
        ) : horasDisponibles.length ===
          0 ? (
          <Text
            style={
              styles.emptyText
            }
          >
            No hay horarios disponibles para esta fecha.
          </Text>
        ) : (
          <View
            style={
              styles.optionsContainer
            }
          >
            {horasDisponibles.map(
              (
                horaDisponible
              ) => (
                <TouchableOpacity
                  key={
                    horaDisponible
                  }
                  style={[
                    styles.optionButton,

                    hora ===
                      horaDisponible &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    setHora(
                      horaDisponible
                    );

                    setError("");
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,

                      hora ===
                        horaDisponible &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {formatearHora(
                      horaDisponible
                    )}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* TRATAMIENTO */}
        <Text
          style={[
            styles.label,
            {
              marginTop: 18,
            },
          ]}
        >
          Tratamiento
        </Text>

        <View
          style={
            styles.treatmentList
          }
        >
          {listaTratamientos.map(
            (
              tratamiento
            ) => {
              const seleccionado =
                tratamientoSeleccionado
                  ?.id_tratamiento ===
                tratamiento.id_tratamiento;

              return (
                <TouchableOpacity
                  key={
                    tratamiento.id_tratamiento
                  }
                  style={[
                    styles.treatmentOption,

                    seleccionado &&
                      styles.treatmentOptionSelected,
                  ]}
                  onPress={() => {
                    setTratamientoSeleccionado(
                      tratamiento
                    );

                    setError("");
                  }}
                >
                  <Text
                    style={[
                      styles.treatmentName,

                      seleccionado &&
                        styles.treatmentNameSelected,
                    ]}
                  >
                    🦷{" "}
                    {
                      tratamiento.nombre
                    }
                  </Text>

                  {tratamiento.duracion ? (
                    <Text
                      style={
                        styles.treatmentDetail
                      }
                    >
                      Duración:{" "}
                      {
                        tratamiento.duracion
                      }{" "}
                      min
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* GUARDAR */}
        <TouchableOpacity
          style={[
            styles.button,

            cargando &&
              styles.buttonDisabled,
          ]}
          onPress={
            handleActualizar
          }
          disabled={
            cargando
          }
        >
          {cargando ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              GUARDAR CAMBIOS
            </Text>
          )}
        </TouchableOpacity>

        {/* CANCELAR */}
        <TouchableOpacity
          style={
            styles.cancelLink
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.cancelLinkText
            }
          >
            CANCELAR
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
        "#F0FDF4",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
      alignItems: "center",
    },

    loadingContainer: {
      flex: 1,
      backgroundColor:
        "#F0FDF4",
      justifyContent:
        "center",
      alignItems: "center",
      gap: 12,
    },

    loadingText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#475569",
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
      marginBottom: 20,
    },

    logoBox: {
      width: 56,
      height: 56,
      backgroundColor:
        "#0088FF",
      borderRadius: 18,
      justifyContent:
        "center",
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
      maxWidth: 430,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
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
      marginBottom: 16,
    },

    infoBox: {
      backgroundColor:
        "#E0F2FE",
      borderWidth: 1,
      borderColor:
        "#7DD3FC",
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },

    infoText: {
      color: "#075985",
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 17,
    },

    label: {
      fontSize: 13,
      color: "#334155",
      fontWeight: "700",
      marginBottom: 8,
    },

    input: {
      width: "100%",
      backgroundColor:
        "#FEF9C3",
      borderWidth: 1,
      borderColor:
        "#94A3B8",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: "#1E293B",
      fontSize: 15,
    },

    helperText: {
      fontSize: 11,
      color: "#64748B",
      marginTop: 5,
      marginBottom: 16,
    },

    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    optionButton: {
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 9,
    },

    optionButtonSelected: {
      backgroundColor:
        "#0088FF",
      borderColor:
        "#0088FF",
    },

    optionText: {
      color: "#334155",
      fontSize: 13,
      fontWeight: "700",
    },

    optionTextSelected: {
      color: "#FFFFFF",
    },

    treatmentList: {
      gap: 9,
    },

    treatmentOption: {
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      borderRadius: 14,
      padding: 13,
      backgroundColor:
        "#F8FAFC",
    },

    treatmentOptionSelected: {
      borderColor:
        "#0088FF",
      backgroundColor:
        "#E0F2FE",
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
      marginTop: 4,
      fontSize: 11,
      color: "#64748B",
    },

    emptyText: {
      color: "#64748B",
      fontSize: 13,
      marginBottom: 8,
    },

    errorBox: {
      backgroundColor:
        "#FEE2E2",
      borderWidth: 1,
      borderColor:
        "#FCA5A5",
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
      backgroundColor:
        "#DCFCE7",
      borderWidth: 1,
      borderColor:
        "#86EFAC",
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
      backgroundColor:
        "#0088FF",
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