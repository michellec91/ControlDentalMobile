import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    ThemePreference,
} from "../constants/theme";

import {
    useAppTheme,
} from "../context/ThemeContext";

type OpcionTema = {
  valor: ThemePreference;
  titulo: string;
  descripcion: string;
  icono:
    | "sunny-outline"
    | "moon-outline"
    | "phone-portrait-outline";
};

const opciones: OpcionTema[] = [
  {
    valor: "light",
    titulo: "Claro",
    descripcion:
      "Mantiene la aplicación con colores claros.",
    icono: "sunny-outline",
  },
  {
    valor: "dark",
    titulo: "Oscuro",
    descripcion:
      "Usa colores oscuros para reducir el brillo.",
    icono: "moon-outline",
  },
  {
    valor: "system",
    titulo: "Automático",
    descripcion:
      "Usa el mismo modo configurado en tu dispositivo.",
    icono: "phone-portrait-outline",
  },
];

export default function AppearanceScreen() {
  const {
    preferencia,
    modoActual,
    colors,
    cambiarTema,
  } = useAppTheme();

  const handleCambiarTema = async (
    tema: ThemePreference
  ) => {
    try {
      await cambiarTema(tema);
    } catch (error) {
      console.error(
        "No se pudo cambiar el tema:",
        error
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* ENCABEZADO */}
      <View
        style={styles.header}
      >
        <Pressable
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  colors.text,
              },
            ]}
          >
            Apariencia
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            Elegí cómo querés ver
            la aplicación.
          </Text>
        </View>
      </View>

      {/* OPCIONES */}
      <View
        style={styles.optionsContainer}
      >
        {opciones.map(
          (opcion) => {
            const seleccionada =
              preferencia ===
              opcion.valor;

            return (
              <Pressable
                key={
                  opcion.valor
                }
                style={[
                  styles.optionCard,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      seleccionada
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() =>
                  void handleCambiarTema(
                    opcion.valor
                  )
                }
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        seleccionada
                          ? colors.primaryLight
                          : colors.input,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      opcion.icono
                    }
                    size={25}
                    color={
                      seleccionada
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>

                <View
                  style={
                    styles.optionTextContainer
                  }
                >
                  <Text
                    style={[
                      styles.optionTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      opcion.titulo
                    }
                  </Text>

                  <Text
                    style={[
                      styles.optionDescription,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {
                      opcion.descripcion
                    }
                  </Text>
                </View>

                {seleccionada ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={25}
                    color={
                      colors.primary
                    }
                  />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={25}
                    color={
                      colors.border
                    }
                  />
                )}
              </Pressable>
            );
          }
        )}
      </View>

      {/* INFORMACIÓN */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={colors.primary}
        />

        <Text
          style={[
            styles.infoText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Tema actual:{" "}
          <Text
            style={{
              color:
                colors.text,
              fontWeight:
                "700",
            }}
          >
            {modoActual ===
            "dark"
              ? "Oscuro"
              : "Claro"}
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 24,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 28,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 25,
      fontWeight: "800",
    },

    subtitle: {
      fontSize: 14,
      marginTop: 4,
      lineHeight: 20,
    },

    optionsContainer: {
      gap: 14,
    },

    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
    },

    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    optionTextContainer: {
      flex: 1,
    },

    optionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },

    optionDescription: {
      fontSize: 13,
      lineHeight: 19,
      paddingRight: 10,
    },

    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 14,
      padding: 15,
      gap: 10,
      marginTop: 24,
    },

    infoText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
    },
  });