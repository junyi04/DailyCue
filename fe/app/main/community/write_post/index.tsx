import ChooseTag from "@/components/main_screen/community/write_post/ChooseTag";
import WriteBox from "@/components/main_screen/community/write_post/WriteBox";
import { COLORS, SIZES } from "@/constants/theme";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WritePostScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 80, backgroundColor: COLORS.secondary }}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.text}>나가기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
          <Text style={styles.text}>저장</Text>
        </TouchableOpacity>
      </View>
      <View>
        <ChooseTag />
      </View>
      <View style={{ flex: 1 }}>
        <WriteBox />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButton: {
    position: 'absolute',
    top: 40,
    right: SIZES.large,
    zIndex: 10,
  },
})
