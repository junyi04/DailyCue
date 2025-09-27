import { COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Image } from "react-native-elements";

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkRedirectOrSession = async () => {
      const url = await Linking.getInitialURL();
      console.log("📩 초기 URL:", url);

      if (url?.startsWith("dailycuetest://login-callback")) {
        console.log("✅ 카카오에서 리디렉션됨:", url);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
          console.log("세션 유저:", session.user);
          router.replace("/main");
          return;
        } else {
          console.error("세션 없음:", error);
        }
      }

      // 기본 동작 (2초 후 로그인 화면)
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          router.replace("/auth/login");
        });
      }, 2000);
    };

    checkRedirectOrSession();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require("@/assets/images/DailyCue1.png")}
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
