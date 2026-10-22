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

import { useAuth } from "../../context/AuthContext";

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
  const params = useLocalSearchParams();

  const { usuario } = useAuth();

  const hoy = new Date();

  const hoyStr =
    `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(2, "0")}-${String(
      hoy.getDate()
    ).padStart(2, "0")}`;

  const [
    fecha,
    setFecha,
  ] = useState("");

  const [
    hora,
    setHora,
  ] = useState("");

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
        // CITAS
        // -------------------------------------
        const resCitas =
          await fetch(
            `${API_URL}/citas`
          );

        const dataCitas =
          await resCitas
            .json()
            .catch(() => []);

        if (!resCitas.ok) {
          throw new Error(
            dataCitas?.error ||
              "No se pudieron obtener las citas."
          );
        }

        setCitasExistentes(
          Array.isArray(dataCitas)
            ? dataCitas
            : []
        );

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
                  tratamiento.estado.toLowerCase() ===
                    "activo"
              )
            : [];

        setListaTratamientos(
          tratamientosActivos
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
                  horario.estado.toLowerCase() ===
                    "activo"
              )
            : [];

        setHorarios(
          horariosActivos
        );

        // -------------------------------------
        // TRATAMIENTO PRESELECCIONADO
        // -------------------------------------
        const paramTratamiento =
          params.treatmentId ||
          params.id_tratamiento ||
          params.tratamiento;

        if (
          paramTratamiento &&
          tratamientosActivos.length >
            0
        ) {
          const encontrado =
            tratamientosActivos.find(
              (
                tratamiento: Tratamiento
              ) =>
                String(
                  tratamiento.id_tratamiento
                ) ===
                  String(
                    paramTratamiento
                  ) ||
                tratamiento.nombre ===
                  String(
                    paramTratamiento
                  )
            );

          if (encontrado) {
            setTratamientoSeleccionado(
              encontrado
            );
          }
        }
      } catch (error) {
        console.error(
          "Error al cargar los datos:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible cargar los datos."
        );
      } finally {
        setCargandoDatos(false);
      }
    };

  // -----------------------------------------
  // NORMALIZAR NOMBRE DEL DÍA
  // -----------------------------------------
  const obtenerNombreDia =
    (fechaSeleccionada: string) => {
      if (!fechaSeleccionada) {
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
        horaInicioNumero * 60 +
        minutoInicio;

      const minutosFinales =
        horaFinNumero * 60 +
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
          minutosActuales % 60;

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

        // Intervalos de una hora.
        minutosActuales += 60;
      }

      return resultado;
    };

  // -----------------------------------------
  // HORARIOS DISPONIBLES
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
          (horario) =>
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
        (horaDisponible) => {
          const horaBD =
            `${horaDisponible}:00`;

          const ocupada =
            citasExistentes.some(
              (cita) => {
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
    ]);

  // Limpiar hora si cambia la fecha.
  useEffect(() => {
    setHora("");

    if (!fecha) {
      setError("");
      return;
    }

    const nombreDia =
      obtenerNombreDia(fecha);

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
        (horario) =>
          normalizarTexto(
            horario.dia_semana
          ) ===
          normalizarTexto(
            nombreDia
          )
      );

    if (
      horarios.length > 0 &&
      !horarioExiste
    ) {
      setError(
        "La clínica no posee un horario activo para ese día."
      );

      return;
    }

    setError("");
  }, [
    fecha,
    horarios,
  ]);

  // -----------------------------------------
  // FORMATEAR HORA
  // -----------------------------------------
  const formatearHora =
    (hora24: string) => {
      const [
        horas,
        minutos,
      ] =
        hora24
          .slice(0, 5)
          .split(":");

      const numeroHora =
        Number(horas);

      if (numeroHora === 0) {
        return `12:${minutos} a. m.`;
      }

      if (numeroHora === 12) {
        return `12:${minutos} p. m.`;
      }

      if (numeroHora > 12) {
        return `${
          numeroHora - 12
        }:${minutos} p. m.`;
      }

      return `${numeroHora}:${minutos} a. m.`;
    };

  // -----------------------------------------
  // CONFIRMAR
  // -----------------------------------------
  const handleConfirmar =
    async () => {
      setError("");
      setExito("");

      if (!usuario) {
        setError(
          "Debes iniciar sesión para solicitar una cita."
        );

        return;
      }

      const idUsuario =
        usuario.id_usuario;

      if (!idUsuario) {
        setError(
          "No fue posible identificar al usuario."
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

      if (fecha < hoyStr) {
        setError(
          "No puedes solicitar una cita para una fecha pasada."
        );

        return;
      }

      if (
        obtenerNombreDia(
          fecha
        ) === "domingo"
      ) {
        setError(
          "La clínica permanece cerrada los domingos."
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
          id_usuario:
            Number(
              idUsuario
            ),

          id_tratamiento:
            tratamientoSeleccionado.id_tratamiento,

          fecha,

          hora:
            horaBD,
        };

        const res =
          await fetch(
            `${API_URL}/citas`,
            {
              method: "POST",

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
              "No se pudo crear la solicitud."
          );
        }

        setExito(
          "¡Solicitud de cita enviada con éxito!"
        );

        setTimeout(() => {
          router.replace(
            "/appointments"
          );
        }, 1000);
      } catch (error) {
        console.error(
          "Error al crear cita:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Error de conexión con el servidor."
        );
      } finally {
        setCargando(false);
      }
    };

  // -----------------------------------------
  // CARGANDO
  // -----------------------------------------
  if (cargandoDatos) {
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
          Cargando información...
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
          style={styles.title}
        >
          Nueva cita
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Selecciona fecha,
          hora y tratamiento
        </Text>

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
          style={styles.label}
        >
          Fecha
        </Text>

        <TextInput
          value={fecha}
          onChangeText={
            setFecha
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

        {/* HORAS */}
        <Text
          style={styles.label}
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
                  onPress={() =>
                    setHora(
                      horaDisponible
                    )
                  }
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
              marginTop: 16,
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
                tratamientoSeleccionado?.id_tratamiento ===
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
                  onPress={() =>
                    setTratamientoSeleccionado(
                      tratamiento
                    )
                  }
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

        <TouchableOpacity
          style={[
            styles.button,
            cargando &&
              styles.buttonDisabled,
          ]}
          onPress={
            handleConfirmar
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
              SOLICITAR CITA
            </Text>
          )}
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

    loadingContainer: {
      flex: 1,
      backgroundColor:
        "#F0F9FF",
      justifyContent:
        "center",
      alignItems: "center",
      gap: 12,
    },

    loadingText: {
      color: "#475569",
      fontSize: 14,
      fontWeight: "600",
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
      marginBottom: 20,
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
  });