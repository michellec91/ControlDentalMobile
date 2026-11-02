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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import HeroCard from "../components/home/HeroCard";
import HomeActions from "../components/home/HomeActions";
import HomeHeader from "../components/home/HomeHeader";
import LocationCard from "../components/home/LocationCard";
import NextAppointmentCard from "../components/home/NextAppointmentCard";
import ScheduleCard from "../components/home/ScheduleCard";
import SideMenu from "../components/home/SideMenu";

import { colors } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { obtenerCitasPorUsuario } from "../services/api";

type Cita = {
  id_cita: number;
  id_usuario: number;
  id_tratamiento: number;

  tratamiento_nombre: string;

  fecha: string;
  hora: string;
  estado: string;
};

export default function HomeScreen() {
  const [
    menuVisible,
    setMenuVisible,
  ] = useState(false);

  const [
    proximaCita,
    setProximaCita,
  ] = useState<Cita | null>(
    null
  );

  const [
    cargandoCita,
    setCargandoCita,
  ] = useState(true);

  const [
    errorCita,
    setErrorCita,
  ] = useState(false);

  const { usuario, obtenerIdUsuario } =
    useAuth();

  const router =
    useRouter();

  // -----------------------------------------
  // CARGAR PRÓXIMA CITA
  // -----------------------------------------
  useFocusEffect(
    useCallback(() => {
      let activo = true;

      const cargarProximaCita =
        async () => {
          setCargandoCita(
            true
          );

          setErrorCita(
            false
          );

          let idUsuario = usuario?.id_usuario || 0;
          if (usuario && !idUsuario) {
            try {
              idUsuario = await obtenerIdUsuario();
            } catch (error) {
              console.warn("No se pudieron vincular las citas del paciente:", error);
            }
          }

          if (!idUsuario) {
            if (activo) {
              setProximaCita(
                null
              );

              setCargandoCita(
                false
              );
            }

            return;
          }

          try {
            const citas =
              (await obtenerCitasPorUsuario(
                idUsuario
              )) as Cita[];

            const ahora =
              new Date();

            const futuras =
              citas
                .filter(
                  (
                    cita
                  ) => {
                    const estado =
                      cita.estado
                        ?.toLowerCase() ||
                      "";

                    // No mostrar como próxima
                    // una cita cancelada o completada.
                    if (
                      estado ===
                        "cancelada" ||
                      estado ===
                        "completada"
                    ) {
                      return false;
                    }

                    const fechaLimpia =
                      cita.fecha
                        ?.split(
                          "T"
                        )[0];

                    if (
                      !fechaLimpia ||
                      !cita.hora
                    ) {
                      return false;
                    }

                    const fechaHora =
                      new Date(
                        `${fechaLimpia}T${cita.hora}`
                      );

                    return (
                      !Number.isNaN(
                        fechaHora.getTime()
                      ) &&
                      fechaHora >=
                        ahora
                    );
                  }
                )
                .sort(
                  (
                    a,
                    b
                  ) => {
                    const fechaA =
                      new Date(
                        `${a.fecha.split("T")[0]}T${a.hora}`
                      ).getTime();

                    const fechaB =
                      new Date(
                        `${b.fecha.split("T")[0]}T${b.hora}`
                      ).getTime();

                    return (
                      fechaA -
                      fechaB
                    );
                  }
                );

            if (activo) {
              setProximaCita(
                futuras[0] ??
                  null
              );
            }
          } catch (error) {
            console.error(
              "Error al cargar la próxima cita:",
              error
            );

            if (activo) {
              setErrorCita(
                true
              );

              setProximaCita(
                null
              );
            }
          } finally {
            if (activo) {
              setCargandoCita(
                false
              );
            }
          }
        };

      cargarProximaCita();

      return () => {
        activo = false;
      };
    }, [usuario, obtenerIdUsuario])
  );

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          colors.background
        }
        translucent={
          false
        }
      />

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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <HomeHeader
          onMenuPress={() =>
            setMenuVisible(
              true
            )
          }
        />

        <HeroCard />

        {/* PRÓXIMA CITA */}
        {cargandoCita ? (
          <View
            style={
              styles.message
            }
          >
            <ActivityIndicator
              color={
                colors.primary
              }
            />
          </View>
        ) : errorCita ? (
          <Text
            style={
              styles.messageText
            }
          >
            No se pudo cargar tu
            próxima cita.
          </Text>
        ) : proximaCita ? (
          <NextAppointmentCard
            fecha={
              proximaCita.fecha
            }
            hora={
              proximaCita.hora
            }
            tratamiento={
              proximaCita.tratamiento_nombre ||
              "Consulta dental"
            }
            onPress={() =>
              router.push(
                "/appointments"
              )
            }
          />
        ) : (
          <View
            style={
              styles.emptyCard
            }
          >
            <Text
              style={
                styles.emptyTitle
              }
            >
              No tienes citas
              próximas
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Solicita tu próxima
              visita para cuidar
              tu sonrisa.
            </Text>

            <Text
              style={
                styles.link
              }
              onPress={() =>
                router.push(
                  "/appointment/create"
                )
              }
            >
              Solicitar una cita
            </Text>
          </View>
        )}

        <ScheduleCard />

        <HomeActions />

        <LocationCard />

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
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
    },

    message: {
      padding: 20,
      alignItems:
        "center",
    },

    messageText: {
      color:
        colors.textSecondary,
      marginTop: 20,
      marginBottom: 8,
    },

    emptyCard: {
      marginTop: 24,
      padding: 18,
      borderRadius: 20,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    emptyTitle: {
      fontSize: 16,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    emptyText: {
      fontSize: 14,
      color:
        colors.textSecondary,
      marginTop: 8,
    },

    link: {
      color:
        colors.primary,
      fontWeight:
        "700",
      marginTop: 14,
    },

    bottomSpace: {
      height: 35,
    },
  });