import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Record } from '@/types';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';


const { width } = Dimensions.get('window');

type CardSectionProps = {
  records: Record[];
  initialIndex: number;
}

const CardSection: React.FC<CardSectionProps> = ({ records, initialIndex }) => {
  const renderItem = ({ item }: { item: Record }) => (
    <View style={styles.card}>
      <View style={styles.stressTextContainer}>
        {item.emoji !== undefined &&
          <Text style={styles.stressText}>{item.emoji}</Text>
        }
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>{item.content}</Text>
      </View>
      <Text style={styles.createdAtText}>
        {format(new Date(item.createdAt), 'yyyy-MM-dd')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Carousel
        key={records.length}
        loop={false}
        width={width}
        height={500}
        data={records}
        defaultIndex={initialIndex}
        scrollAnimationDuration={500}
        renderItem={renderItem}    
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.75,
          parallaxScrollingOffset: 130,
        }}
      />
      <TouchableOpacity style={styles.closeButton} onPress={() => router.push("/main")}>
        <Text style={styles.closeText}>나가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.blueGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: { 
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    padding: SIZES.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.large,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stressTextContainer: {
    position: 'absolute',
    top: SIZES.ultra,
    left: SIZES.ultra,
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: width * 0.5,
  },
  stressText: {
    width: 100,
    height: 100,
    fontSize: 45,
    fontWeight: 'bold',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: COLORS.semiBlueGray,
    color: COLORS.white,
    borderRadius: width * 0.5,
    borderColor: COLORS.blueGray,
    borderWidth: 15,
  },
  contentContainer: {
    position: 'absolute',
    top: 200,
    width: '80%',
    height: 200,
    marginHorizontal: SIZES.medium,
  },
  contentText: {
    fontSize: 20,

  },
  createdAtText: {
    position: 'absolute',
    bottom: SIZES.ultra,
    right: SIZES.ultra,
    ...FONTS.h3,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    borderRadius: width * 0.5,
  },
  closeText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  
});

export default CardSection;