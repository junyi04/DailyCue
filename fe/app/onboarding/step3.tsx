import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../../components/onboarding/ProgressBar';

const Step3 = () => {
  const router = useRouter();

  const handleComplete = () => {
    // 메인 화면으로 이동
    router.replace('/main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={3} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messageContainer}>
          <Text style={styles.title}>모든 준비가 끝났어요.</Text>
          <Text style={styles.description}>
            데일리큐를 통해 마음을 돌보는{'\n'}
            여정을 시작해보세요
          </Text>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>시작하기</Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#666666',
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Step3;
