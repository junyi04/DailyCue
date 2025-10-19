import { COLORS } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 1) 현재 세션 먼저 확인 (세션 없으면 getUser 호출 금지)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("세션 확인 실패:", sessionError);
          router.replace("/auth/login");
          return;
        }

        const session = sessionData.session;

        if (!session) {
          // 세션이 없으면 로그인 화면으로 이동
          router.replace("/auth/login");
          return;
        }

        // 2) 세션이 있으면 사용자 ID로 프로필 확인
        const userId = session.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profile) {
          router.replace("/main");
          return;
        }

        router.replace("/onboarding/step1");
      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        // 오류 발생 시 로그인 화면으로 이동
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    // 1.5초 후 인증 상태 확인
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
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