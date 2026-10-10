import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

type HomeHeaderProps = {
  onMenuPress: () => void;
};

export default function HomeHeader({
  onMenuPress,
}: HomeHeaderProps) {
  const handleHomePress = () => {
    router.replace("/");
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.header}>
      <Pressable
        style={styles.homeButton}
        onPress={handleHomePress}
      >
        <View style={styles.logo}>
          <Ionicons
            name="medical-outline"
            size={24}
            color={colors.white}
          />
        </View>

        <View style={styles.brandContainer}>
          <Text style={styles.brand}>Control Dental</Text>

          <Text style={styles.clinic}>
            CLÍNICA DENTAL SONRISAS
          </Text>
        </View>
      </Pressable>

      <Pressable
        style={styles.profileButton}
        onPress={handleProfilePress}
      >
        <Ionicons
          name="person-circle-outline"
          size={27}
          color={colors.text}
        />
      </Pressable>

      <Pressable
        style={styles.menuButton}
        onPress={onMenuPress}
      >
        <Ionicons
          name="menu"
          size={27}
          color={colors.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  homeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandContainer: {
    flex: 1,
    marginLeft: 12,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  clinic: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.4,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});