import { COLORS, SIZES } from "@/constants/theme";
import { StyleSheet, TextInput, View } from "react-native";

interface WriteBoxProps {
  title: string;
  setTitle: (t: string) => void;
  content: string;
  setContent: (c: string) => void;
}

const WriteEmotion: React.FC<WriteBoxProps> = ({
  title,
  setTitle,
  content,
  setContent,
}) => {
  return (
    <View style={styles.postContainer}>
      <View style={styles.titleContainer}>
        <TextInput
          style={styles.title}
          value={title}
          onChangeText={setTitle}
          placeholder="제목을 입력해주세요."
          placeholderTextColor={COLORS.darkGray}
          returnKeyType="next"
        />
      </View>

      <View style={styles.contentContainer}>
        <TextInput
          style={styles.content}
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="내용을 입력해주세요."
          placeholderTextColor={COLORS.darkGray}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.small,
  },
  titleContainer: {
    borderBottomWidth: 0.5,
    borderColor: COLORS.gray,
    padding: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    marginTop: SIZES.small,
    height: 200,
    borderWidth: 1,
    borderColor: COLORS.pageBackground,
    borderRadius: 20,
    padding: 10,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    fontSize: 15,
    padding: 10,
  },
});

export default WriteEmotion;
