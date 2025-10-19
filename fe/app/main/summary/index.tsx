import { dailyReports } from "@/constants/dummyData";
import { COLORS, SIZES } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SummaryScreen() {
  const [report, setReport] = useState<any>(null); // 상태를 객체로 변경

  useEffect(() => {
    const checkReportStatus = async () => {
      const reportGenerated = await AsyncStorage.getItem('reportGenerated');
      
      // 이미 리포트가 생성된 경우
      if (reportGenerated === 'true') {
        const savedReport = await AsyncStorage.getItem('report');
        
        if (savedReport) {
          try {
            console.log("Saved report:", savedReport); // 저장된 값 확인용 로그
            // JSON으로 저장한 리포트 데이터를 객체로 변환
            const parsedReport = JSON.parse(savedReport);
            setReport(parsedReport);
          } catch (error) {
            console.error("JSON Parse error:", error);
            // 파싱 실패 시 랜덤 리포트 생성
            const randomReport = dailyReports[Math.floor(Math.random() * dailyReports.length)];
            setReport(randomReport);
          }
        }
      } else {
        // 랜덤 리포트를 선택하여 생성
        const randomReport = dailyReports[Math.floor(Math.random() * dailyReports.length)];
        setReport(randomReport);
      }
    };

    checkReportStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>주간 리포트</Text>
        {report ? (
          <>
            <View style={styles.reportSection}>
              <Text style={styles.reportTitle}>{report.title1}</Text>
              <Text style={styles.reportContent}>{report.content1}</Text>
            </View>

            <View style={styles.reportSection}>
              <Text style={styles.reportTitle}>{report.title2}</Text>
              <Text style={styles.reportContent}>{report.content2}</Text>
            </View>

            <View style={styles.reportSection}>
              <Text style={styles.reportTitle}>{report.title3}</Text>
              <Text style={styles.reportContent}>{report.content3}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>리포트를 불러오는 중입니다...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 10,
    textAlign: "center",
    width: "100%",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  reportSection: {
    marginBottom: SIZES.medium,
    padding: 15,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    backgroundColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  reportContent: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "left",
    color: "#333",
    fontFamily: "Roboto",
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 20,
  }
});