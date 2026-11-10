import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import HomeHeader from "../components/home/HomeHeader";
import SideMenu from "../components/home/SideMenu";
import { useAppTheme } from "../context/ThemeContext";
import { obtenerTratamientos } from "../services/api";

interface Tratamiento {
  id_tratamiento: number;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  duracion?: number;
  estado?: string;
  imagen?: string | null;
}

export default function TreatmentsScreen() {
  const { colors, modoActual } = useAppTheme();
  const styles = createStyles(colors, modoActual);
  
  const keyboardFields = useRef<(TextInput | null)[]>([]);

  const [search, setSearch] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (keyboardVisible) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [keyboardVisible]);

  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    tratamientos,
    setTratamientos,
  ] = useState<Tratamiento[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // -----------------------------------------
  // CARGAR TRATAMIENTOS
  // -----------------------------------------
  useEffect(() => {
    const cargarTratamientos =
      async () => {
        try {
          setCargando(true);
          setError("");

          const datos =
            await obtenerTratamientos();

          const lista =
            Array.isArray(datos)
              ? datos
              : [];

          const tratamientosActivos =
            lista.filter(
              (
                tratamiento: Tratamiento
              ) =>
                !tratamiento.estado ||
                tratamiento.estado.toLowerCase() ===
                  "activo"
            );

          setTratamientos(
            tratamientosActivos
          );
        } catch (error) {
          console.error(
            "Error cargando tratamientos:",
            error
          );

          setTratamientos([]);

          setError(
            error instanceof Error
              ? error.message
              : "No fue posible cargar los tratamientos."
          );
        } finally {
          setCargando(false);
        }
      };

    cargarTratamientos();
  }, []);

  // -----------------------------------------
  // FILTRAR TRATAMIENTOS
  // -----------------------------------------
  const filteredTreatments =
    useMemo(() => {
      const busqueda =
        search
          .trim()
          .toLowerCase();

      if (!busqueda) {
        return tratamientos;
      }

      return tratamientos.filter(
        (tratamiento) => {
          const nombre =
            tratamiento.nombre
              ?.toLowerCase() ||
            "";

          const descripcion =
            tratamiento.descripcion
              ?.toLowerCase() ||
            "";

          return (
            nombre.includes(
              busqueda
            ) ||
            descripcion.includes(
              busqueda
            )
          );
        }
      );
    }, [
      search,
      tratamientos,
    ]);

  // -----------------------------------------
  // AGENDAR TRATAMIENTO
  // -----------------------------------------
  const handleSchedule = (
    treatment: Tratamiento
  ) => {
    router.push({
      pathname:
        "/appointment/create",

      params: {
        treatmentId: String(
          treatment.id_tratamiento
        ),

        id_tratamiento:
          String(
            treatment.id_tratamiento
          ),
      },
    });
  };

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
    >
      <SideMenu
        visible={
          menuVisible
        }
        onClose={() =>
          setMenuVisible(
            false
          )
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {!keyboardVisible && (
          <>
        <HomeHeader
          onMenuPress={() =>
            setMenuVisible(
              true
            )
          }
        />

        <Image
          source={require(
            "../../assets/images/treatments.jpg"
          )}
          style={
            styles.heroImage
          }
          resizeMode="cover"
        />

        <View
          style={
            styles.header
          }
        >
          <Text
            style={
              styles.eyebrow
            }
          >
            SERVICIOS
          </Text>

          <Text
            style={
              styles.title
            }
          >
            Nuestros tratamientos
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Conocé las opciones
            disponibles y encontrá
            el tratamiento que
            necesitás.
          </Text>
        </View>
          </>
        )}

        {/* BUSCADOR */}
        <View
          style={
            styles.searchContainer
          }
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={
              colors.textSecondary
            }
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Buscar tratamiento"
            placeholderTextColor={
              colors.textSecondary
            }
            style={
              styles.searchInput
            }
          ref={(input) => { keyboardFields.current[0] = input; }}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {/* CARGANDO */}
        {cargando ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Cargando tratamientos...
            </Text>
          </View>
        ) : error ? (
          // ERROR
          <View
            style={
              styles.errorContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#D9534F"
            />

            <Text
              style={
                styles.errorText
              }
            >
              {error}
            </Text>
          </View>
        ) : (
          <>
            {/* RESULTADOS */}
            <View
              style={
                styles.resultsHeader
              }
            >
              <Text
                style={
                  styles.resultsText
                }
              >
                {
                  filteredTreatments.length
                }{" "}
                {filteredTreatments.length ===
                1
                  ? "tratamiento"
                  : "tratamientos"}
              </Text>
            </View>

            {/* LISTA */}
            <View
              style={
                styles.list
              }
            >
              {filteredTreatments.length >
              0 ? (
                filteredTreatments.map(
                  (
                    treatment
                  ) => (
                    <View
                      key={
                        treatment.id_tratamiento
                      }
                      style={
                        styles.card
                      }
                    >
                      <View
                        style={
                          styles.cardTop
                        }
                      >
                        <View
                          style={
                            styles.iconContainer
                          }
                        >
                          <Ionicons
                            name="medical-outline"
                            size={
                              22
                            }
                            color={
                              colors.primary
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.cardHeaderText
                          }
                        >
                          <Text
                            style={
                              styles.cardTitle
                            }
                          >
                            {
                              treatment.nombre
                            }
                          </Text>

                          <Text
                            style={
                              styles.duration
                            }
                          >
                            {treatment.duracion
                              ? `${treatment.duracion} min`
                              : "Duración no especificada"}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.price
                          }
                        >
                          $
                          {Number(
                            treatment.precio ||
                              0
                          ).toFixed(
                            2
                          )}
                        </Text>
                      </View>

                      <Text
                        style={
                          styles.description
                        }
                      >
                        {treatment.descripcion ||
                          "Sin descripción disponible."}
                      </Text>

                      <Pressable
                        style={
                          styles.button
                        }
                        onPress={() =>
                          handleSchedule(
                            treatment
                          )
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Solicitar cita
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={
                            18
                          }
                          color={
                            colors.white
                          }
                        />
                      </Pressable>
                    </View>
                  )
                )
              ) : (
                <View
                  style={
                    styles.emptyContainer
                  }
                >
                  <Ionicons
                    name="search-outline"
                    size={32}
                    color={
                      colors.textSecondary
                    }
                  />

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No se encontraron
                    tratamientos.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  colors: any,
  modoActual: "light" | "dark"
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      paddingHorizontal:
        20,
      paddingTop: 12,
      paddingBottom:
        40,
    },

    heroImage: {
      width: "100%",
      height: 165,
      borderRadius: 22,
      marginBottom: 22,
    },

    header: {
      marginBottom: 20,
    },

    eyebrow: {
      fontSize: 11,
      fontWeight:
        "800",
      letterSpacing:
        1.2,
      color:
        colors.primary,
      marginBottom: 6,
    },

    title: {
      fontSize: 28,
      fontWeight:
        "800",
      color:
        colors.text,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.textSecondary,
      marginTop: 8,
    },

    searchContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius: 16,
      paddingHorizontal:
        14,
      marginBottom: 18,
    },

    searchInput: {
      flex: 1,
      paddingVertical:
        14,
      marginLeft: 9,
      fontSize: 15,
      color:
        colors.text,
    },

    loadingContainer: {
      alignItems:
        "center",
      paddingVertical:
        40,
      gap: 12,
    },

    loadingText: {
      fontSize: 13,
      color:
        colors.textSecondary,
      fontWeight:
        "600",
    },

    errorContainer: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
    modoActual === "dark"
      ? "#3A2020"
      : "#FDECEA",
      borderWidth: 1,
      borderColor:
    modoActual === "dark"
      ? "#7F1D1D"
      : "#F5C6CB",
      borderRadius: 14,
      padding: 14,
      gap: 8,
    },

    errorText: {
      flex: 1,
      color:
    modoActual === "dark"
      ? "#FCA5A5"
      : "#D9534F",
      fontSize: 13,
      fontWeight:
        "600",
    },

    resultsHeader: {
      marginBottom: 12,
    },

    resultsText: {
      fontSize: 13,
      fontWeight:
        "600",
      color:
        colors.textSecondary,
    },

    list: {
      gap: 14,
    },

    card: {
      backgroundColor:
        colors.surface,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    cardTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    iconContainer: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
    modoActual === "dark"
      ? colors.input
      : colors.primaryLight,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cardHeaderText: {
      flex: 1,
      marginLeft: 12,
    },

    cardTitle: {
      fontSize: 16,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    duration: {
      fontSize: 12,
      color:
        colors.textSecondary,
      marginTop: 4,
    },

    price: {
      fontSize: 18,
      fontWeight:
        "800",
      color:
        colors.secondary,
    },

    description: {
      fontSize: 13,
      lineHeight: 20,
      color:
        colors.textSecondary,
      marginTop: 15,
    },

    button: {
      marginTop: 16,
      backgroundColor:
        colors.primary,
      borderRadius: 14,
      paddingVertical:
        13,
      paddingHorizontal:
        16,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    buttonText: {
      color:
        colors.white,
      fontSize: 14,
      fontWeight:
        "700",
    },

    emptyContainer: {
      alignItems:
        "center",
      paddingVertical:
        36,
      gap: 10,
    },

    emptyText: {
      fontSize: 13,
      color:
        colors.textSecondary,
      textAlign:
        "center",
    },
  });