import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { login } from "@react-native-seoul/kakao-login";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);

      // Kakao SDK 로그인
      const token = await login();
      console.log("Access Token:", token.accessToken);
      console.log(token.idToken);

      // Supabase Edge Function 호출
      const res = await fetch(
        "https://xvzgdwbssmuwsycwtlho.supabase.co/functions/v1/kakao-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token.idToken }),
        }
      );

      // 응답 파싱
      const session = await res.json();
      console.log("Supabase Session:", session);

      if (!res.ok) {
        console.error("로그인 실패:", session);
        return;
      }

      // 세션 저장
      if (session?.access_token && session?.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (error) {
          console.error("세션 설정 실패:", error);
          return;
        }

        console.log("✅ 세션 등록 완료:", data.session);
      } else {
        console.error("세션 토큰이 없습니다:", session);
        return;
      }

      // 로그인 성공 후 이동
      router.replace("/onboarding/step1");

    } catch (err: any) {
      console.error("카카오 로그인 에러:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaProvider style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>로그인 중...</Text>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerWrap}>
          <Image
            source={require('@/assets/images/DailyCue.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>하루를 케어하다</Text>
        </View>

        <TouchableOpacity onPress={handleKakaoLogin} style={styles.kakaoBtn}>
          <Image
            source={require('@/assets/images/kakaoTalk.png')}
            style={styles.kakaoIcon}
          />
          <Text style={styles.kakaoText}>카카오로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...FONTS.h3,
    color: COLORS.white,
    marginTop: 20,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    width: 120,
    height: 84,
  },
  brand: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: 24,
  },
  kakaoBtn: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: SIZES.medium,
    backgroundColor: '#FEE500',
  },
  kakaoIcon: {
    width: 24,
    height: 24,
  },
  kakaoText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: '#3C1E1E',
  },
});