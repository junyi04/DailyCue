import { COLORS } from "@/constants/theme";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PostCreation() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/main/community")}>
        <Text style={styles.closeText}>나가기</Text>
        <Text>게시글 작성할 수 있는 화면</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  closeText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
})
