import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Image } from "react-native-elements";

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // 3초 후 로그인 화면으로 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/auth/login");
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("@/assets/images/DailyCue.png")}
        style={{ width: 100, height: 70 }}
      />
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
  text: {
    fontSize: 35,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
