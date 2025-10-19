import MessagePart from "@/components/main_screen/ai_partner/MessagePart";
import { dailyReports } from "@/constants/dummyData";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// 리포트 타입 정의
interface Report {
  success: boolean;
  title1: string;
  content1: string;
  title2: string;
  content2: string;
  title3: string;
  content3: string;
  hasData: boolean;
  recordsCount: number;
  chatCount: number;
  date: string;
}

export default function AiPartnerScreen() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  // 리포트 생성 버튼 클릭 시 더미 데이터를 랜덤으로 가져오는 함수
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport(null);

    setTimeout(async () => {
      // 랜덤 리포트 선택
      const randomReport = dailyReports[Math.floor(Math.random() * dailyReports.length)];

      // 랜덤 리포트로 리포트 설정
      const newReport: Report = {
        success: true,
        title1: randomReport.title1,
        content1: randomReport.content1,
        title2: randomReport.title2,
        content2: randomReport.content2,
        title3: randomReport.title3,
        content3: randomReport.content3,
        hasData: true,
        recordsCount: 1,
        chatCount: 1,
        date: new Date().toISOString(),
      };

      setReport(newReport);
      setIsGenerating(false);

      // 리포트 생성 후 AsyncStorage에 저장
      try {
        await AsyncStorage.setItem('reportGenerated', 'true');
        await AsyncStorage.setItem('report', JSON.stringify(randomReport)); // stringify로 저장
        console.log("Report saved:", randomReport); // 확인용 로그
      } catch (error) {
        console.error("Error saving report to AsyncStorage:", error);
      }

      router.push("/main/summary");
    }, 3000);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daily 챗</Text>
          {isGenerating ? (
            <Text style={{ color: COLORS.red, fontSize: 15, fontWeight: 'bold' }}>
              생성 중..
            </Text>
          ) : (

            <TouchableOpacity
              onPress={handleGenerateReport}
              disabled={isGenerating}
              style={{ backgroundColor: COLORS.red, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 }}
            >
              <Text style={{ color: COLORS.white, fontSize: 12, fontWeight: 'bold' }}>
                리포트 생성
              </Text>
            </TouchableOpacity>
            )}
          </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <MessagePart />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pageBackground,
  },
  header: {
    paddingVertical: SIZES.small,
    paddingLeft: 25,
    paddingRight: 15,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...FONTS.h3,
    fontWeight: "bold",
  },
});