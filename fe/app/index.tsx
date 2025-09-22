import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function LoginScreen() {  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text>로그인 페이지</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/auth/register")}>
        <Text>회원가입 페이지</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff1',
  },
})