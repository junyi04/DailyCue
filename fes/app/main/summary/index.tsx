import Folders from "@/components/main_screen/summary/Folders";
import Header from "@/components/main_screen/summary/Header";
import YearNavigator from "@/components/main_screen/summary/YearNavigator";
import { useState } from "react";
import { StyleSheet, View } from "react-native";


export default function SummaryScreen() {
  const [year, setYear] = useState(2025); // 기준 년도

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <Header />

      {/* 년도 선택 */}
      <YearNavigator
        year={year} 
        onPrev={() => setYear(year - 1)} 
        onNext={() => setYear(year + 1)} 
        onYearChange={setYear}
      />

      {/* 년도별 월간 폴더 */}
      <Folders year={year} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})