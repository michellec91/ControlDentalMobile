import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

type HomeHeaderProps = {
  onMenuPress: () => void;
};

export default function HomeHeader({
  onMenuPress,
}: HomeHeaderProps) {
  const { usuario } =
    useAuth();

  const fotoPerfil =
    usuario?.imagen_perfil ||
    null;

  const handleHomePress =
    () => {
      router.replace(
        "/home"
      );
    };

  const handleProfilePress =
    () => {
      router.push(
        "/profile"
      );
    };

  return (
    <View
      style={styles.header}
    >
      {/* LOGO */}
      <Pressable
        style={
          styles.homeButton
        }
        onPress={
          handleHomePress
        }
      >
        <View
          style={styles.logo}
        >
          <Ionicons
            name="medical-outline"
            size={24}
            color={
              colors.white
            }
          />
        </View>

        <View
          style={
            styles.brandContainer
          }
        >
          <Text
            style={
              styles.brand
            }
          >
            Control Dental
          </Text>

          <Text
            style={
              styles.clinic
            }
          >
            CLÍNICA DENTAL
            SONRISAS
          </Text>
        </View>
      </Pressable>

      {/* PERFIL */}
      <Pressable
        style={
          styles.profileButton
        }
        onPress={
          handleProfilePress
        }
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil del usuario"
      >
        {fotoPerfil ? (
          <Image
            source={{
              uri: fotoPerfil,
            }}
            style={
              styles.profileImage
            }
            resizeMode="cover"
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={27}
            color={
              colors.text
            }
          />
        )}
      </Pressable>

      {/* MENÚ */}
      <Pressable
        style={
          styles.menuButton
        }
        onPress={
          onMenuPress
        }
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <Ionicons
          name="menu"
          size={27}
          color={
            colors.text
          }
        />
      </Pressable>
    </View>
  );
}

const styles =
  StyleSheet.create({
    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 24,
    },

    homeButton: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    logo: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        colors.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    brandContainer: {
      flex: 1,
      marginLeft: 12,
    },

    brand: {
      fontSize: 18,
      fontWeight:
        "700",
      color:
        colors.text,
    },

    clinic: {
      fontSize: 10,
      color:
        colors.primary,
      fontWeight:
        "700",
      marginTop: 2,
      letterSpacing:
        0.4,
    },

    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 4,
      overflow:
        "hidden",
    },

    profileImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        colors.surface,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        "center",
      justifyContent:
        "center",
    },
  });