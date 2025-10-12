import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../../components/onboarding/ProgressBar';


const Step2 = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [ageRange, setAgeRange] = useState<string | null>(null);

  const ageGroups = ['20대', '30대', '40대', '50대', '60대 이상'];

  const handleNext = async () => {
    if (!nickname.trim() && gender && ageRange) {
      return;
    }
    router.push({
      pathname: "/onboarding/step3",
      params: {
        nickname,
        gender,
        ageRange,
      }
    })
  };

  const isFormValid = nickname.trim() && gender && ageRange;

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={3} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>DailyCue에서 사용할 프로필을 입력해 주세요</Text>
          <Text style={styles.subtitle}>
            이곳은 오직 보호자님들을 위한 익명의 공간입니다.{'\n'}
            나를 표현할 수 있는 닉네임을 입력해주세요.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  gender === 'male' && styles.optionButtonSelected
                ]}
                onPress={() => setGender('male')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  gender === 'male' && styles.optionButtonTextSelected
                ]}>
                  남성
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  gender === 'female' && styles.optionButtonSelected
                ]}
                onPress={() => setGender('female')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  gender === 'female' && styles.optionButtonTextSelected
                ]}>
                  여성
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>연령대</Text>
            <View style={styles.ageGroupContainer}>
              {ageGroups.map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[
                    styles.ageButton,
                    ageRange === age && styles.ageButtonSelected
                  ]}
                  onPress={() => setAgeRange(age)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.ageButtonText,
                    ageRange === age && styles.ageButtonTextSelected
                  ]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.infoText}>
            ※ 성별과 연령대 정보는 비슷한 상황의 보호자님들과{'\n'}
            연결되고 맞춤형 채팅을 진행하도록 돕습니다.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !isFormValid && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>다음 &gt;</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 30,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666666',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#E8F0FE',
  },
  optionButtonText: {
    fontSize: 15,
    color: '#666666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  ageGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ageButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  ageButtonSelected: {
    borderColor: '#1E40AF',
    backgroundColor: '#E8F0FE',
  },
  ageButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  ageButtonTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#999999',
    marginTop: 10,
  },
  nextButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Step2;
