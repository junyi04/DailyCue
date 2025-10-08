import { login } from "@react-native-seoul/kakao-login";
import { router } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const handleKakaoLogin = async () => {
    try {
      // Kakao SDK 로그인
      const token = await login();
      console.log("🟡 token object:", token);
      console.log("🟢 Access Token:", token.accessToken);
      console.log("🟢 ID Token:", token.idToken);


      // Supabase Edge Function 호출
      const res = await fetch(
        "https://iewyffoogsqutukommtp.supabase.co/functions/v1/kakao-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token.accessToken }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error("로그인 실패:", result);
        Alert.alert("로그인 실패", result.error || "서버 오류");
        return;
      }

      console.log("Supabase 세션 생성 완료:", result);
      Alert.alert("로그인 성공", "환영합니다!");
      router.replace("/main");
    } catch (err: any) {
      console.error("❌ 카카오 로그인 에러:", err);
      Alert.alert("로그인 실패", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        onPress={handleKakaoLogin}
        style={{
          backgroundColor: "#FEE500",
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>카카오로 로그인 / 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}