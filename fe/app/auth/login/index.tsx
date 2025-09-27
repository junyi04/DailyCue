import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function LoginScreen() {
  // Supabase OAuth 리다이렉션
  const redirectUrl = Linking.createURL("login-callback");
  console.log("redirectUrl (LoginScreen):", redirectUrl);

  const handleKakaoLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: { redirectTo: redirectUrl },
      });

      if (error) {
        console.error("supabase 카카오 로그인 실패:", error.message);
        return;
      }

      console.log("Supabase 발급 URL:", data.url);

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        console.log("openAuthSessionAsync 결과:", result);

        if (result.type === "success") {
          console.log("카카오 로그인 redirect 성공, 앱으로 돌아감");
        } else {
          console.warn("로그인 취소 또는 실패:", result.type);
        }
      }
    } catch (err) {
      console.error("카카오 로그인 에러:", err);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.headerWrap}>
        <Image
          source={require('@/assets/images/DailyCue1.png')}
          style={{ width: 100, height: 70 }}
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
          onPress={() => router.push("/main")}
        >
          <Text style={styles.primaryText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, styles.signupBtn]}
          onPress={() => router.push("/auth/register")}
        >
          <Text style={styles.signupText}>회원 가입</Text>
        </TouchableOpacity>
      </View>

      {/* 소셜 로그인 */}
      <View style={styles.socialWrap}>
        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={require('@/assets/images/google.png')} 
            style={{ width: 30, height: 30 }}
          />
          <Text style={styles.socialText}>구글로 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.naverBtn}>
          <Image
            source={require('@/assets/images/naver.png')} 
            style={{ width: 30, height: 30 }}
          />
          <Text style={[styles.socialText, { color: COLORS.white }]}>네이버 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleKakaoLogin} style={styles.kakaoBtn}>
          <Image
            source={require('@/assets/images/kakaoTalk.png')}
            style={{ width: 20, height: 20 }}
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
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: COLORS.secondary,
    paddingTop: 100,
  },
  headerWrap: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  brand: {
    fontSize: 23,
    color: COLORS.white,
    fontWeight: "bold",
    marginTop: 20,
  },
  input: {
    ...FONTS.h3,
    width: "95%",
    backgroundColor: "#cfdfff",
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    height: 45,
    borderColor: "#E5E7EB",
    color: "#111827",
    marginBottom: 10,
  },
  primaryActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
    height: 50,
    borderRadius: SIZES.medium,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginHorizontal: 8,
  },
  loginBtn: {
    backgroundColor: COLORS.white,
  },
  signupBtn: {
    backgroundColor: "#002b76",
  },
  primaryText: {
    ...FONTS.h3,
    fontWeight: "bold",
    color: "#002b76",
  },
  signupText: {
    ...FONTS.h3,
    fontWeight: "bold",
    color: COLORS.white,
  },
  socialWrap: {
    width: "95%",
    marginTop: SIZES.mega,
  },
  googleBtn: {
    height: 50,
    flexDirection: "row",
    gap: 10,
    borderRadius: SIZES.medium,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  naverBtn: {
    height: 50,
    flexDirection: "row",
    gap: 10,
    borderRadius: SIZES.medium,
    backgroundColor: "#2DB400",
    borderWidth: 1,
    borderColor: "#2DB400",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  kakaoBtn: {
    height: 50,
    flexDirection: "row",
    gap: 15,
    borderRadius: SIZES.medium,
    backgroundColor: "#FEE500",
    alignItems: "center",
    justifyContent: "center",
  },
  kakaoText: {
    ...FONTS.h3,
    fontWeight: "bold",
    color: "#3C1E1E",
  },
  socialText: {
    ...FONTS.h3,
    fontWeight: "bold",
    color: "#3C1E1E",
  },
});
