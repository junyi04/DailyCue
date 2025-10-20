import { FONTS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DetailScreen() {
  const { year, month, week } = useLocalSearchParams<{ year: string; month: string; week: string }>();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={25} /> 
      </TouchableOpacity>

      <Text style={styles.text}>
        {week === "all"
          ? `${year}년 ${Number(month) + 1}월 전체 보기`
          : `${year}년 ${Number(month) + 1}월 ${week}주차`}
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: SIZES.large,
    zIndex: 10,
  },
  text: {
    ...FONTS.h2,
  }
})