/*import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeroCard from "../components/home/HeroCard";
import HomeActions from "../components/home/HomeActions";
import HomeHeader from "../components/home/HomeHeader";
import LocationCard from "../components/home/LocationCard";
import ScheduleCard from "../components/home/ScheduleCard";
import SideMenu from "../components/home/SideMenu";
import { colors } from "../constants/theme";

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
        translucent={false}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <HomeHeader
          onMenuPress={() => setMenuVisible(true)}
        />

        <HeroCard />

        <ScheduleCard />

        <HomeActions />

        <LocationCard />

        <View style={styles.bottomSpace} />
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
  },

  bottomSpace: {
    height: 35,
  },
});*/

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}