import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Post, Record } from "@/types";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";


interface ChooseEmojiProps {
  selectedEmoji: Record['emoji'] | null;
  onSelectEmoji: (emoji: Record['emoji']) => void;
}

const ChooseEmotion:React.FC<ChooseEmojiProps> = ({ selectedEmoji, onSelectEmoji }) => {

  const emojis: Record['emoji'][] = ['😍', '😆', '😯', '😐', '😭', '😡'];

  return (
    <View style={styles.container}>
      {/* <Text style={{ ...FONTS.h3, fontWeight: 'bold', paddingHorizontal: SIZES.medium, marginVertical: 5 }} >이모지 선택</Text> */}
      <View style={styles.emojiContainer}>
        {emojis.map(emoji => {
          const isActive = emoji === selectedEmoji;
          return (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emoji,
              ]}
              onPress={() => onSelectEmoji(emoji)}
            >
              <Text style={[FONTS.h1, isActive && { borderWidth: 3, borderRadius: 50, borderColor: COLORS.darkBlueGray, paddingHorizontal: 2 }]}>
                {emoji}
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
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    padding: SIZES.small,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.large,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emoji: {
  },
})

export default ChooseEmotion;