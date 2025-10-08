import { Stack } from 'expo-router';

const OnboardingLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen
        name="step1"
        options={{
          headerShown: false,
          title: '',
        }}
      />
      <Stack.Screen
        name="step2"
        options={{
          headerShown: false,
          title: '',
        }}
      />
      <Stack.Screen
        name="step3"
        options={{
          headerShown: false,
          title: '',
        }}
      />
    </Stack>
  );
};

export default OnboardingLayout;
