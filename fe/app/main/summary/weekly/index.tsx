import Files from "@/components/main_screen/summary/weekly/Files";
import Header from "@/components/main_screen/summary/weekly/Header";
import { SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// 더미 리포트 데이터
const dummyReport = {
  success: true,
  report: "📊 하루 요약: 오늘은 피로도가 높았지만 아이와의 시간이 즐거웠습니다...",
  hasData: true,
  recordsCount: 3,
  chatCount: 2,
  date: "2025-01-20"
};

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
      <Header />
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
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 30,
  }
});