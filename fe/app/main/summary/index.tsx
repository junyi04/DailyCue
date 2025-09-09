import { StyleSheet, Text, View } from "react-native";

export default function SummaryScreen() {
  return (
    <View style={styles.container}>
      <Text>AI 챗봇과의 대화과 이 화면에 파일로 저장됩니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})