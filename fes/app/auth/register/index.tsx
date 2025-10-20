import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function RegisterScreen() {
  const handleRegister = () => {
    router.replace("/main");
  };

  return (
    <View>
      <Text>회원가입 화면</Text>
      <Button title="회원가입 완료" onPress={handleRegister} />
    </View>
  );
}
