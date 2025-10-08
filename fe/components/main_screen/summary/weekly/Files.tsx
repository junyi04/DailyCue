import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";


function getWeeksInMonth(year: number, month: number): number {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const usedDays = firstDay.getDay() + lastDay.getDate();
  return Math.ceil(usedDays / 7);
}

const Files: React.FC = () => {
  const { year, month } = useLocalSearchParams<{ year: string; month: string }>();

  const weeks = getWeeksInMonth(Number(year), Number(month));
  const data = ["all", ...Array.from({ length: weeks }, (_, i) => i + 1)];

  const handlePress = (week: number | string) => {
    if (week === "all") {
      router.push(`/main/summary/weekly/detail?year=${year}&month=${month}&week=all`);
    } else {
      router.push(`/main/summary/weekly/detail?year=${year}&month=${month}&week=${week}`);
    }
  };

  const renderItem = ({ item }: { item: number | string }) => (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity style={styles.weekFolder} onPress={() => handlePress(item)}>
        <Ionicons name="document-text-outline" size={100} color={"#444"} />
      </TouchableOpacity>
      <Text style={styles.weekText}>
        {item === "all" ? "전체" : `${item}주차`}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.toString()}
      numColumns={2}
      contentContainerStyle={styles.weekList}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  weekFolder: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 30,
    marginTop: 10,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  weekList: {
    paddingBottom: 100,
  },
});

export default Files;
