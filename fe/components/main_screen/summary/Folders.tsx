import { COLORS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";

interface FolderProps {
  year: number;
}

const Folders: React.FC<FolderProps> = ({ year }) => {

  const handleMonthPress = (month: number) => {
    router.push(`/main/summary/weekly?year=${year}&month=${month}`);
  };

  const renderMonthItem = ({ item }: { item: number }) => (
    <View>
      <TouchableOpacity
        style={styles.monthFolder}
        onPress={() => handleMonthPress(item)}
      >
        <Image
          source={require('@/assets/images/folder.png')}
          style={{
            width: 50,
            height: 50,
          }}
          tintColor={COLORS.secondary}
        />
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.monthText}>{`${item + 1}월`}</Text>
        <Ionicons name="ellipsis-horizontal" style={{ marginTop: 10, marginHorizontal: 5 }} size={15}  />
      </View>
    </View>
  );

  return (
    // 1 ~ 12월까지 쭉 보여줌
    <FlatList
      data={Array.from({ length: 12 }, (_, i) => i)}
      renderItem={renderMonthItem}
      keyExtractor={(item) => item.toString()}
      numColumns={2}
      contentContainerStyle={styles.monthList}
      columnWrapperStyle={styles.monthListColumn}
      showsVerticalScrollIndicator={false}
    />
  );
}


const styles = StyleSheet.create({
  monthFolder: {
    marginTop: SIZES.large,
    backgroundColor: COLORS.white,
    paddingHorizontal: 55,
    paddingVertical: 30,
    borderRadius: SIZES.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  monthText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 0,
    marginTop: 10,
    marginHorizontal: 5,
  },
  monthList: {
    paddingBottom: 100,
    alignItems: 'center',
  },
  monthListColumn: {
    gap: 20,
  },
});
export default Folders;