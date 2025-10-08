import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < currentStep ? styles.progressSegmentActive : styles.progressSegmentInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#1E40AF',
  },
  progressSegmentInactive: {
    backgroundColor: '#E0E0E0',
  },
});

export default ProgressBar;
