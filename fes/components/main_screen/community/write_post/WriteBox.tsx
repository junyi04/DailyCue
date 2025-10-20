import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { View, Text, StyleSheet, TextInput } from "react-native";


interface WriteBoxProps {
  title: string;
  setTitle: (t: string) => void;
  content: string;
  setContent: (c: string) => void;
}

const WriteBox: React.FC<WriteBoxProps> = ({ title, setTitle, content, setContent }) => {
  return (
    <View style={styles.container}>
      <Text style={{ ...FONTS.h3, fontWeight: 'bold' }}>글 작성</Text>
      <View style={styles.postContainer}>
        <View style={styles.titleContainer}>
          <TextInput 
            style={styles.title}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요. (최대 20자)"
            placeholderTextColor={COLORS.gray}
            
          />
        </View>
        <View style={styles.contentContainer}>
          <TextInput 
            style={styles.content}
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="내용을 입력해주세요."
            placeholderTextColor={COLORS.gray}
          />
        </View>
      </View>
    </View>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.mega,
  },
  postContainer: {
    flex: 1,
    paddingVertical: SIZES.medium,
  },
  titleContainer: {
    borderBottomWidth: 0.5,
    borderColor: COLORS.gray,
    paddingVertical: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    padding: 10
  },
  contentContainer: {
    // KeyBoardAvoidingView에 의해 Content 부분이 글 작성 시 올라감
    flex: 1,
    marginTop: SIZES.small,
  },
  content: {
    flex: 1,
    fontSize: 15,
    padding: 10,
    textAlignVertical: 'top',
  },
})

export default WriteBox;