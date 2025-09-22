import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { FontAwesome5 } from "@expo/vector-icons";
import KakaoLogins from "@react-native-seoul/kakao-login";
import { router } from "expo-router";
import { Linking, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";


export default function LoginScreen() {
  const handleKakaoLogin = async () => {
    try {
      const result = await KakaoLogins.login();
      console.log("카카오 로그인 결과:", result);
      const { accessToken } = result;

      if (accessToken) {
        router.replace("/main");
      }
    } catch (error) {
      console.error("카카오 로그인 실패:", error);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrap}>
        <FontAwesome5
          name="hand-holding-medical" 
          size={130} 
          color={COLORS.white}
          style={{ marginLeft: SIZES.medium, marginBottom: 50, }}
        />
        <View style={styles.textContainer}>
          <Text style={styles.brand}>DailyCue,</Text>
          <Text style={styles.brand}>일상을 치료하다.</Text>
        </View>
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
        <TouchableOpacity style={[styles.primaryBtn, styles.signupBtn]}>
          <Text style={styles.signupText}>회원 가입</Text>
        </TouchableOpacity>
      </View>

      {/* 아이디/비밀번호 찾기 */}
      <TouchableOpacity onPress={() => Linking.openURL('#')}>
        <Text style={styles.findLink}>아이디 / 비밀번호 찾기</Text>
      </TouchableOpacity>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: COLORS.secondary,
    paddingTop: 90,
  },
  headerWrap: {
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  textContainer: {
    position: 'absolute',
    right: 15,
    alignItems: 'flex-end',
  },
  brand: {
    fontSize: 25,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  input: {
    ...FONTS.h3,
    width: '95%',
    backgroundColor: COLORS.pageBackground,
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    height: 50,
    borderColor: '#E5E7EB',
    color: '#111827',
    marginBottom: 10,

  },
  findLink: {
    ...FONTS.h4,
    alignSelf: 'flex-end',
    color: '#EDF3FF',
    textDecorationLine: 'underline',
    marginBottom: SIZES.medium,
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
    marginHorizontal: 8,
  },
  loginBtn: {
    backgroundColor: COLORS.darkBlueGray,
  },
  signupBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  primaryText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  signupText: {
    ...FONTS.h3,
    fontWeight: 'bold',
    color: COLORS.darkBlueGray,
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
    marginBottom: 10,
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
