import { createContext, useContext, useState } from 'react';


const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  // 온보딩 과정에서 입력받을 데이터의 초기 상태
  const [onboardingData, setOnboardingData] = useState({
    nickname: '',
    gender: '',
    age_range: '',
  });

  // 데이터를 업데이트
  const updateOnboardingData = (updates) => {
    setOnboardingData((prevData) => ({ ...prevData, ...updates }));
  };

  // Provider는 value를 통해 데이터와 함수를 하위 컴포넌트에 전달
  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};