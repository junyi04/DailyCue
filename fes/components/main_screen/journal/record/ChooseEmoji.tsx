import { COLORS, SIZES } from "@/constants/theme";
import { Record } from "@/types";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";


const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth * 0.45;
const ITEM_HEIGHT = ITEM_WIDTH * 1.1;

interface ChooseEmojiProps {
  selectedEmoji: Record['emoji'] | null;
  onSelectEmoji: (emoji: Record['emoji']) => void;
}

const ChooseEmotion: React.FC<ChooseEmojiProps> = ({ selectedEmoji, onSelectEmoji }) => {
  // 0-5 점수에 맞는 이모지 (0=매우좋음, 5=매우나쁨)
  const emojis: Record['emoji'][] = ['😍', '😆', '😯', '😐', '😭', '😡'];
  
  // 점수를 이모지로 변환하는 함수
  const getEmojiFromScore = (score: number): Record['emoji'] => {
    if (score >= 0 && score <= 5) {
      return emojis[score];
    }
    return '😐'; // 기본값
  };
  
  // 이모지를 점수로 변환하는 함수
  const getScoreFromEmoji = (emoji: Record['emoji']): number => {
    const index = emojis.indexOf(emoji);
    return index >= 0 ? index : 2; // 기본값 2 (보통)
  };

  const defaultIndex = selectedEmoji ? emojis.indexOf(selectedEmoji) : Math.floor(emojis.length / 2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘 하루를 돌아보며..</Text>
      <Text style={styles.subtitle}>피곤함 정도를 선택해주세요</Text>

      <Carousel
        loop={false}
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        data={emojis}
        defaultIndex={defaultIndex}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => onSelectEmoji(emojis[index])} // 스크롤이 멈출 때 이모지를 선택
        renderItem={({ item, index }) => {
          const isActive = item === selectedEmoji;
          const score = getScoreFromEmoji(item);
          const scoreText = ['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨', '화남'][score];

          return (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.itemContainer}
              onPress={() => onSelectEmoji(item)}
            >
              <View style={[styles.card, isActive && styles.cardActive]}>
                <Text style={[styles.emojiText, !isActive && styles.emojiTextInactive]}>
                  {item}
                </Text>
                <Text style={[styles.scoreText, !isActive && styles.scoreTextInactive]}>
                  {score}점
                </Text>
                <Text style={[styles.scoreLabel, !isActive && styles.scoreLabelInactive]}>
                  {scoreText}
                </Text>
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
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 10,
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
  emojiText: {
    fontSize: ITEM_WIDTH * 0.5,
  },
  emojiTextInactive: {
    opacity: 0.8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginTop: 8,
  },
  scoreTextInactive: {
    opacity: 0.6,
  },
  scoreLabel: {
    fontSize: 13,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreLabelInactive: {
    opacity: 0.6,
  },
});

export default ChooseEmotion;