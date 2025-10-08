import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../../components/onboarding/ProgressBar';

type Agreement = {
  id: string;
  text: string;
  required: boolean;
};

const Step1 = () => {
  const router = useRouter();
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const agreementList: Agreement[] = [
    { id: 'terms', text: '서비스 이용약관 동의', required: true },
    { id: 'privacy', text: '개인정보 처리방침 동의', required: true },
    { id: 'marketing', text: '마케팅 정보 수신 동의', required: false },
  ];

  const handleToggleAgreement = (id: string) => {
    setAgreements(prev => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  };

  const handleNext = () => {
    if (agreements.terms && agreements.privacy) {
      router.push('/onboarding/step2');
    }
  };

  const isFormValid = agreements.terms && agreements.privacy;

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.textContainer}>
          <Text style={styles.greeting}>당신의 매일에,</Text>
          <Text style={styles.subtitle}>따뜻한 치유의 신호를 보냅니다</Text>

          <Text style={styles.description}>
            DailyCue는 돌봄으로 분주한 일상 속,{'\n'}
            잠시 멈춰 나의 마음을 돌볼 수 있도록 돕는{'\n'}
            보호자를 위한 마음 치유 앱입니다
          </Text>
        </View>

        <View style={styles.agreementContainer}>
          {agreementList.map((agreement) => (
            <TouchableOpacity
              key={agreement.id}
              style={styles.checkboxRow}
              onPress={() => handleToggleAgreement(agreement.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                agreements[agreement.id as keyof typeof agreements] && styles.checkboxChecked
              ]}>
                {agreements[agreement.id as keyof typeof agreements] && (
                  <View style={styles.checkboxInner} />
                )}
              </View>
              <Text style={styles.agreementText}>
                {agreement.text}
                {agreement.required && <Text style={styles.required}> (필수)</Text>}
                {!agreement.required && <Text style={styles.optional}> (선택)</Text>}
              </Text>
            </TouchableOpacity>
          ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  textContainer: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666666',
  },
  agreementContainer: {
    marginBottom: 40,
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    borderColor: '#1E40AF',
    backgroundColor: '#1E40AF',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  agreementText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  required: {
    color: '#EF4444',
    fontWeight: '600',
  },
  optional: {
    color: '#999999',
  },
  nextButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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

export default Step1;
