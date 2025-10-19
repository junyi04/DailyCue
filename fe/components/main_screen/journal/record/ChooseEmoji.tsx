import { emojiImages } from "@/constants/emojiMap";
import { COLORS, SIZES } from "@/constants/theme";
import { EmojiKey, Record } from "@/types";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";


const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth * 0.45;
const ITEM_HEIGHT = ITEM_WIDTH * 1.1;

interface ChooseEmojiProps {
  selectedEmoji: Record['emoji'] | null;
  onSelectEmoji: (emoji: Record['emoji']) => void;
}

const ChooseEmotion: React.FC<ChooseEmojiProps> = ({ selectedEmoji, onSelectEmoji }) => {
  const emojis: EmojiKey[] = ['love', 'happy', 'soso', 'weird', 'sad', 'angry'];

  let defaultIndex = emojis.indexOf(selectedEmoji as EmojiKey);
  if (defaultIndex < 0) defaultIndex = Math.floor(emojis.length / 2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>어떤 일이 있었나요?</Text>

      <Carousel
        loop={false}
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        data={emojis}
        defaultIndex={defaultIndex}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => onSelectEmoji(emojis[index])} // 스크롤이 멈출 때 이모지를 선택
        renderItem={({ item }) => {
          const isActive = item === selectedEmoji;

          return (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.itemContainer}
              onPress={() => onSelectEmoji(item)}
            >
              <View style={[styles.card, isActive && styles.cardActive]}>
                <Image
                  source={emojiImages[item]}
                  style={[styles.emojiImage, !isActive && styles.emojiImageInactive]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          );
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.75, // 비활성 아이템 크기
          parallaxScrollingOffset: 50, // 아이템 간 간격
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SIZES.large,
    gap: SIZES.large,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    height: '90%',
    borderRadius: SIZES.large,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardActive: {
    transform: [{ scale: 1.1 }],
    elevation: 10,
    shadowOpacity: 0.2,
  },
  emojiImage: {
    width: ITEM_WIDTH * 0.8,
    height: ITEM_WIDTH * 0.8,
  },
  emojiImageInactive: {
    opacity: 0.7,
  },
});

export default ChooseEmotion;