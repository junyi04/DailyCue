import { TAGS } from "@/constants/communityContents";
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Post } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const { width } = Dimensions.get('window');

const TAG_CONFIG: Record<string, { icon: keyof typeof Ionicons.glyphMap, color: string }> = {
  전체: { icon: "earth", color: COLORS.darkBlueGray },
  공유해요: { icon: "share", color: COLORS.secondary },
  공감원해요: { icon: "beer", color: COLORS.orange },
  함께해요: { icon: "camera", color: COLORS.green },
  고수찾아요: { icon: "airplane", color: COLORS.darkBlue },
}

type TagProps = {
  activeTag: Post['tag'] | null;
  setActiveTag: React.Dispatch<React.SetStateAction<Post['tag'] | null>>;
};

const ChooseTag: React.FC<TagProps> = ({ activeTag, setActiveTag }) => {

  return(
    <View style={styles.tagContainer}>
        {TAGS.map(tag => {
          const config = TAG_CONFIG[tag];
          return (
            <TouchableOpacity
              key={tag}
              style={styles.tagWrapper}
              onPress={() => setActiveTag(tag)}
            >
              <View style={[styles.tagIcon, activeTag === tag && styles.activeTag]}>
                <Ionicons name={config.icon} size={24} color={config.color} />
              </View>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    width: 50,
    height: 50,
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.base,
    borderRadius: width * 0.5,
    marginRight: SIZES.small,
  },
  tagWrapper: {
    alignItems: 'center',
    marginHorizontal: SIZES.small,
  },
  tagIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#eee',
    borderRadius: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  activeTag: {
    borderWidth: 3,
    borderColor: COLORS.darkBlueGray,
  },
  tagText: {
    ...FONTS.h4,
    fontWeight: '700',
    color: COLORS.darkBlueGray,
  },
})

export default ChooseTag;