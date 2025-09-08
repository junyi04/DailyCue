// 기록을 저장하는 뷰
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Slider } from "react-native-elements";


type EmotionRecordProps = {
  onRecordAdded: (record: {
    stress: number;
    content: string;
    createdAt: string;
  }) => void;
}

const EmotionRecord: React.FC<EmotionRecordProps> = ({ onRecordAdded }) => {
  const [text, setText] = useState('');
  const [stressLevel, setStressLevel] = useState<number>(5);

  const sliderWidth = 270;
  const minValue = 0;
  const maxValue = 10;
  const filledWidth = ((stressLevel - minValue) / (maxValue - minValue)) * sliderWidth;

  const recordOnPressHandler = () => {
    if (!text.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    onRecordAdded({
      stress: stressLevel,
      content: text,
      createdAt: new Date().toISOString(),
    });

    setStressLevel(5);
    setText('');

    router.push('/main/journal');
  };

  return (
    <View style={styles.container}>
      <View style={styles.sliderControls}>
        <Text style={styles.sliderText}>{stressLevel}</Text>

        <View style={[styles.sliderTrackContainer, { width: sliderWidth }]}>
          <View style={styles.trackBase} />
          <View style={[styles.trackFill, { width: filledWidth }]} />

          <Slider 
            style={styles.slider}
            minimumValue={minValue}
            maximumValue={maxValue}
            step={1}
            value={stressLevel}
            onValueChange={setStressLevel}
            maximumTrackTintColor='transparent'
            minimumTrackTintColor='transparent'
            thumbStyle={{
              height: 27,
              width: 27,
              borderWidth: 4,
              borderColor: COLORS.white,
              backgroundColor: '#0f2358',
            }}
          />
        </View>
      </View>
      <Text style={styles.stressExplanation}>0 - 편안함    5 - 보통    10 - 피곤함</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="어떤 일이 있었나요?"
        multiline
        maxLength={100}
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.submitButton} onPress={recordOnPressHandler}>
        <Text style={styles.submitButtonText}>기록 저장하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.small,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  slider: {
    width: 270,
    height: 40,
  },
  sliderTrackContainer: {
    height: 50,
    justifyContent: 'center',
    marginTop: SIZES.small,
  },
  sliderControls: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.medium,
  },
  sliderText: { 
    ...FONTS.h1, 
    color: COLORS.black,
    fontWeight: 'bold',
  },
  trackBase: {
    height: 15,
    borderRadius: 30,
    backgroundColor: COLORS.blueGray,
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    height: 15,
    borderRadius: 30,
    backgroundColor: COLORS.darkBlueGray,
    position: 'absolute',
  },
  stressExplanation: {
    ...FONTS.h4,
    color: COLORS.darkGray,
    marginBottom: SIZES.medium,
  },
  textInput: {
    width: 270,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.medium,
    paddingHorizontal: SIZES.medium,
    minHeight: 50,
    maxHeight: 200,
    textAlignVertical: 'center',
    ...FONTS.body,
    marginTop: SIZES.small,
  },
  submitButton: { 
    width: 270,
    backgroundColor: COLORS.secondary, 
    padding: SIZES.medium, 
    borderRadius: SIZES.medium, 
    alignItems: 'center', 
    marginTop: SIZES.small,
  },
  submitButtonText: { 
    ...FONTS.h3, 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
});

export default EmotionRecord;