import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "../../constants/theme";

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SideMenu({
  visible,
  onClose,
}: SideMenuProps) {
  const router = useRouter();

  const navigateTo = (route: string) => {
    onClose();
    router.push(route as never);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Fondo oscuro */}
        <Pressable
          style={styles.overlay}
          onPress={onClose}
        />

        {/* Menú */}
        <View style={styles.drawer}>
          {/* Encabezado */}
          <View style={styles.top}>
            <View style={styles.brandContainer}>
              <View style={styles.logo}>
                <Ionicons
                  name="medical-outline"
                  size={26}
                  color={colors.white}
                />
              </View>

              <View>
                <Text style={styles.title}>
                  Control Dental
                </Text>

                <Text style={styles.subtitle}>
                  Clínica Dental Sonrisas
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          {/* Opciones */}
          <View style={styles.menu}>
            <Pressable
              style={styles.menuItem}
              onPress={() => navigateTo("/treatments")}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="medical-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.menuText}>
                Tratamientos
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() =>
                navigateTo("/appointment/create")
              }
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.menuText}>
                Agendar cita
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() =>
                navigateTo("/appointments")
              }
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.menuText}>
                Mis citas
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => navigateTo("/contact")}
            >
              <View style={styles.menuIcon}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.menuText}>
                Contacto
              </Text>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Cuidamos tu sonrisa
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(20, 35, 30, 0.38)",
  },

  drawer: {
    width: "84%",
    height: "100%",
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 22,
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  menu: {
    marginTop: 22,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 5,
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  footer: {
    marginTop: "auto",
    marginBottom: 35,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
});