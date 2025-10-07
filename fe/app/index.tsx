import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => router.replace("/auth/login"), 100);
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={require("@/assets/images/DailyCue.png")} style={styles.logo} />
      <Text style={styles.text}>DailyCue</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },
  logo: {
    width: 100,
    height: 70,
    resizeMode: "contain",
  },
  text: {
    fontSize: 35,
    fontWeight: "bold",
    color: COLORS.white,
  },
});