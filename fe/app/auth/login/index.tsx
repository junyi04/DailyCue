import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { login } from "@react-native-seoul/kakao-login";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
        Alert.alert("로그인 실패", session.error || "서버 오류");
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
          Alert.alert("로그인 실패", error.message);
          return;
        }

        console.log("✅ 세션 등록 완료:", data.session);
      } else {
        console.error("세션 토큰이 없습니다:", session);
        Alert.alert("로그인 실패", "세션 토큰을 받지 못했습니다.");
        return;
      }

      // 로그인 성공 후 이동
      router.replace("/onboarding/step1");

    } catch (err: any) {
      console.error("카카오 로그인 에러:", err);
      Alert.alert("로그인 실패", err.message);
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
      <View style={styles.headerWrap}>
        <Image
          source={require('@/assets/images/DailyCue.png')}
          style={{
            width: 100,
            height: 70,
          }}
        />
        <Text style={styles.brand}>하루를 케어하다</Text>
      </View>

      {/* 아이디 */}
      <TextInput
        placeholder="아이디"
        placeholderTextColor="#98A2B3"
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />

      {/* 비밀번호 */}
      <TextInput
        placeholder="비밀번호"
        placeholderTextColor="#98A2B3"
        style={styles.input}
        secureTextEntry
        returnKeyType="done"
      />

      {/* 로그인 / 회원 가입 */}
      <View style={styles.primaryActions}>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.loginBtn]}
          onPress={() => router.push("/main")}>
          <Text style={styles.primaryText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.signupBtn]}
          onPress={() => router.push("/auth/register")}
        >
          <Text style={styles.signupText}>회원 가입</Text>
        </TouchableOpacity>
      </View>

      {/* 아이디/비밀번호 찾기 */}
      <TouchableOpacity onPress={() => Linking.openURL('#')}>
        <Text style={styles.findLink}>아이디 / 비밀번호 찾기</Text>
      </TouchableOpacity>

      {/* 구분선 */}
      <View style={{ width: '95%', borderWidth: 0.5, borderColor: COLORS.primary }} />

      {/* 소셜 로그인 */}
      <View style={styles.socialWrap}>
        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={require('@/assets/images/google.png')} 
            style={{
              width: 30,
              height: 30,
            }} 
          />
          <Text style={styles.socialText}>구글로 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.naverBtn}>
          <Image
            source={require('@/assets/images/naver.png')} 
            style={{
              width: 30,
              height: 30,
            }} 
          />
          <Text style={[styles.socialText, { color: COLORS.white }]}>네이버 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleKakaoLogin} style={styles.kakaoBtn}>
            <Image
              source={require('@/assets/images/kakaoTalk.png')}
              style={{
                width: 20,
                height: 20,
              }}  
            />
            <Text style={styles.kakaoText}>카카오 로그인</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: COLORS.secondary,
    paddingTop: 100,
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  brand: {
    fontSize: 23,
    color: COLORS.white,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    ...FONTS.h3,
    width: '95%',
    backgroundColor: '#cfdfff',
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    height: 45,
    borderColor: '#E5E7EB',
    color: '#111827',
    marginBottom: 10,

  },
  findLink: {
    fontSize: 13,
    alignSelf: 'flex-end',
    color: '#EDF3FF',
    textDecorationLine: 'underline',
    marginBottom: 30,
  },
  primaryActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    borderRadius: SIZES.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginHorizontal: 8,
  },
  loginBtn: {
    backgroundColor: COLORS.white,
  },
  signupBtn: {
    backgroundColor: '#002b76',
  },
  primaryText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: '#002b76',
  },
  signupText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  socialWrap: {
    width: '95%',
    marginTop: SIZES.mega,
  },
  googleBtn: {
    height: 50,
    flexDirection: 'row',
    gap: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  naverBtn: {
    height: 50,
    flexDirection: 'row',
    gap: 10,
    borderRadius: SIZES.medium,
    backgroundColor: '#2DB400',
    borderWidth: 1,
    borderColor: '#2DB400',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  kakaoBtn: {
    height: 50,
    flexDirection: 'row',
    gap: 15,
    borderRadius: SIZES.medium,
    backgroundColor: '#FEE500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: '#3C1E1E',
  },
  socialText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: '#3C1E1E',
  },
});
