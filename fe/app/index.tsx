import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";


export default function SplashScreen() {
  useEffect(() => {
    // 1.5초 후 바로 로그인 화면으로 이동
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/DailyCue.png")}
        style={styles.logo}
      />
      <Text style={styles.text}>DailyCue</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
  },
  logo: {
    width: 100,
    height: 70,
    resizeMode: "contain",
    marginRight: 20,
  },
  text: {
    fontSize: 35,
    fontWeight: "bold",
    color: COLORS.white,
  },
});