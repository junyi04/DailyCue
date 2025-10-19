import { SIZES } from "@/constants/theme";
import { EvilIcons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

interface SearchBoxProps {
  onSearch: (keyword: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  return (
    <View style={styles.container}>
      <EvilIcons name="search" size={25} style={styles.icon} />
      <TextInput
        style={styles.textInput}
        placeholder="키워드나 #태그 모두 검색할 수 있어요."
        onChangeText={onSearch} // ✅ 검색어 변경 시 부모로 전달
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    zIndex: 2,
    left: 30,
    color: "#8a8a8a",
  },
  textInput: {
    width: "90%",
    height: 50,
    margin: SIZES.large,
    borderRadius: SIZES.base,
    paddingHorizontal: 45,
    backgroundColor: "#eee",
  },
});

export default SearchBox;