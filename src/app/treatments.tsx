import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
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
import { colors } from "../constants/theme";
import type { Treatment } from "../data/treatments";
import { obtenerTratamientos } from "../services/api";

export default function TreatmentsScreen() {
  const [search, setSearch] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [tratamientos, setTratamientos] = useState<Treatment[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTratamientos = async () => {
      try {
        const datos = await obtenerTratamientos();
        setTratamientos(datos);
      } catch (error) {
        console.error("Error cargando tratamientos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarTratamientos();
  }, []);

  const filteredTreatments = useMemo(() => {
    return tratamientos.filter((treatment) =>
      treatment.nombre.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, tratamientos]);

  const handleSchedule = (treatment: Treatment) => {
    router.push({
      pathname: "/appointment/create",
      params: {
        treatmentId: treatment.id_tratamiento,
        id_tratamiento: treatment.id_tratamiento,
        tratamiento: treatment.nombre,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HomeHeader onMenuPress={() => setMenuVisible(true)} />

        <Image
          source={require("../../assets/images/treatments.jpg")}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>SERVICIOS</Text>

          <Text style={styles.title}>Nuestros tratamientos</Text>

          <Text style={styles.subtitle}>
            Conocé las opciones disponibles y encontrá el tratamiento que
            necesitás.
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar tratamiento"
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredTreatments.length}{" "}
            {filteredTreatments.length === 1 ? "tratamiento" : "tratamientos"}
          </Text>
        </View>

        <View style={styles.list}>
          {filteredTreatments.map((treatment) => (
            <View key={treatment.id_tratamiento} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="medical-outline"
                    size={22}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{treatment.nombre}</Text>

                  <Text style={styles.duration}>{treatment.duracion} min</Text>
                </View>

                <Text style={styles.price}>
                  ${Number(treatment.precio).toFixed(2)}
                </Text>
              </View>

              <Text style={styles.description}>{treatment.descripcion}</Text>

              <Pressable
                style={styles.button}
                onPress={() => handleSchedule(treatment)}
              >
                <Text style={styles.buttonText}>Agendar tratamiento</Text>

                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
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
    fontWeight: "800",
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 8,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 9,
    fontSize: 15,
    color: colors.text,
  },

  resultsHeader: {
    marginBottom: 12,
  },

  resultsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  list: {
    gap: 14,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  duration: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.secondary,
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 15,
  },

  button: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
