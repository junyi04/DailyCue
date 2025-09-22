import Files from "@/components/main_screen/summary/weekly/Files";
import { FONTS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


type RouteParams = {
  year: string;
  month: string;
}

export default function WeeklyScreen() {
  const route = useRoute();
    const { year, month } = route.params as RouteParams;

  return (
    <View style={styles.container}>
      {/* 뒤로 가기 */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={25} /> 
      </TouchableOpacity>
      {/* 해당 월의 주 파일 */}
      <Text style={styles.text}>{`${year}년 ${Number(month) + 1}월 주간 리포트`}</Text>
      {/* 해당 주간 파일들 */}
      <View style={{ alignItems: 'center', marginVertical: SIZES.large }}>
        <Files />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  text: {
    ...FONTS.h2,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: SIZES.mega,
  }
})