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
      // 초기 URL 가져오기
      const url = await Linking.getInitialURL();
      console.log("초기 URL:", url);

      // 카카오 리디렉션 확인
      if (url?.startsWith("dailycuetest://login-callback")) {
        console.log("카카오에서 리디렉션됨:", url);

        try {
          // 세션 확인
          const { data, error } = await supabase.auth.getSession();

          if (data?.session) {
            // 세션이 있을 경우 메인 화면으로 이동
            console.log("세션 유저:", data.session.user);
            router.replace("/main");
            return;
          } else {
            console.error("세션 없음:", error);
            router.replace("/auth/login"); // 세션 없을 경우 로그인 화면으로
          }
        } catch (error) {
          console.error("세션 확인 중 오류 발생:", error);
          router.replace("/auth/login");
        }
      } else {
        // 2초 후 로그인 화면으로 이동
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            router.replace("/auth/login");
          });
        }, 2000);
      }
    };

    checkRedirectOrSession();
  }, [fadeAnim]);

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
