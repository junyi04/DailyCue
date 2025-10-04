import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";


// 앱이 웹 브라우저를 갔다 돌아왔을 때, 웹 세션을 닫아주는 역할
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 카카오 로그인 핸들러
const handleKakaoLogin = async () => {
  setIsLoggingIn(true);
  try {
    console.log("🟡 카카오 로그인 시도 중...");

    // Supabase로 카카오 OAuth 로그인 요청
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: 'https://iewyffoogsqutukommtp.supabase.co/auth/v1/callback',
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error("로그인 URL을 받지 못했습니다.");

    console.log("🔗 로그인 URL:", data.url);

    // 웹 브라우저에서 카카오 로그인 페이지 열기
    const res = await WebBrowser.openAuthSessionAsync(
      data.url,
      'dailycue://login/callback'
    );

    if (res.type === 'success') {
      console.log("🟢 카카오 로그인 완료 — Supabase 세션 대기 중...");
      Alert.alert("로그인 성공", "카카오 로그인이 완료되었습니다!");

      // 짧은 대기 후 메인으로 이동 (세션 갱신 시간 보정)
      setTimeout(() => {
        router.push("/main");
      }, 1000);
    } else if (res.type === 'cancel' || res.type === 'dismiss') {
      console.warn("⚠️ 카카오 로그인 취소됨");
      Alert.alert("로그인 취소", "카카오 로그인이 취소되었습니다.");
    }
  } catch (err: any) {
    console.error("🔴 로그인 오류:", err);
    Alert.alert("로그인 실패", err.message || "카카오 로그인 중 오류가 발생했습니다.");
  } finally {
    setIsLoggingIn(false);
  }
};


  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.headerWrap}>
        <Image
          source={require('@/assets/images/DailyCue.png')}
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

// import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// import React, { useState } from "react";
// import {
//   login,
//   logout,
//   getProfile as getKakaoProfile,
//   shippingAddresses as getKakaoShippingAddresses,
//   unlink,
// } from "@react-native-seoul/kakao-login";

// const App = () => {
//   const [result, setResult] = useState<string>("");

//   const signInWithKakao = async (): Promise<void> => {
//     try {
//       const token = await login();
//       setResult(JSON.stringify(token));
//       console.log("login success ", token.accessToken);
//     } catch (err) {
//       console.error("login err", err);
//     }
//   };

//   const signOutWithKakao = async (): Promise<void> => {
//     try {
//       const message = await logout();

//       setResult(message);
//     } catch (err) {
//       console.error("signOut error", err);
//     }
//   };

//   const getProfile = async (): Promise<void> => {
//     try {
//       const profile = await getKakaoProfile();

//       setResult(JSON.stringify(profile));
//     } catch (err) {
//       console.error("signOut error", err);
//     }
//   };

//   const getShippingAddresses = async (): Promise<void> => {
//     try {
//       const shippingAddresses = await getKakaoShippingAddresses();

//       setResult(JSON.stringify(shippingAddresses));
//     } catch (err) {
//       console.error("signOut error", err);
//     }
//   };

//   const unlinkKakao = async (): Promise<void> => {
//     try {
//       const message = await unlink();

//       setResult(message);
//     } catch (err) {
//       console.error("signOut error", err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.resultContainer}>
//         <ScrollView>
//           <Text>{result}</Text>
//           <View style={{ height: 100 }} />
//         </ScrollView>
//       </View>
//       <Pressable
//         style={styles.button}
//         onPress={() => {
//           signInWithKakao();
//         }}
//       >
//         <Text style={styles.text}>카카오 로그인</Text>
//       </Pressable>
//       <Pressable style={styles.button} onPress={() => getProfile()}>
//         <Text style={styles.text}>프로필 조회</Text>
//       </Pressable>
//       <Pressable style={styles.button} onPress={() => getShippingAddresses()}>
//         <Text style={styles.text}>배송주소록 조회</Text>
//       </Pressable>
//       <Pressable style={styles.button} onPress={() => unlinkKakao()}>
//         <Text style={styles.text}>링크 해제</Text>
//       </Pressable>
//       <Pressable style={styles.button} onPress={() => signOutWithKakao()}>
//         <Text style={styles.text}>카카오 로그아웃</Text>
//       </Pressable>
//     </View>
//   );
// };

// export default App;

// const styles = StyleSheet.create({
//   container: {
//     height: "100%",
//     justifyContent: "flex-end",
//     alignItems: "center",
//     paddingBottom: 100,
//   },
//   resultContainer: {
//     flexDirection: "column",
//     width: "100%",
//     padding: 24,
//   },
//   button: {
//     backgroundColor: "#FEE500",
//     borderRadius: 40,
//     borderWidth: 1,
//     width: 250,
//     height: 40,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginTop: 10,
//   },
//   text: {
//     textAlign: "center",
//   },
// });