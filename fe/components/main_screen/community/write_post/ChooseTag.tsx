import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Post } from "@/types";
import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";


interface ChooseTagProps {
  selectedTag: Post['tag'] | null;
  onSelectTag: (tag: Post['tag']) => void;
}
const ChooseTag:React.FC<ChooseTagProps> = ({ selectedTag, onSelectTag }) => {

  const tags: Post['tag'][] = ['공유해요', '공감원해요', '함께해요', '고수찾아요'];

  return (
    <View style={styles.container}>
      <Text style={{ ...FONTS.h3, fontWeight: 'bold' }} >게시판 선택</Text>
      <View style={styles.tagContainer}>
        {tags.map(tag => {
          const isActive = tag === selectedTag;
          return (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                isActive && { borderColor: COLORS.secondary, borderWidth: 2 }
              ]}
              onPress={() => onSelectTag(tag)}
            >
              <Text style={[
                styles.tagText,
                isActive && { color: COLORS.secondary, fontWeight: 'bold' }
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: SIZES.mega,
  },
  tagContainer: {
    flexDirection: 'row',
    paddingVertical: SIZES.medium,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.small,
    borderRadius: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 5,
  },
  tagText: {
    ...FONTS.h4,
    color: COLORS.darkGray,
  },
})

export default ChooseTag;