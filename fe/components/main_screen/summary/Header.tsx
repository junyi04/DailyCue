import { StyleSheet, Text, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{`AI 요약 리포트로\n나의 감정 치유 과정을 살펴보세요!`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingBottom: 20,
  },
  text: {
    fontSize: 20,
    lineHeight: 40,
    fontWeight: '700',
  }
})

export default Header;