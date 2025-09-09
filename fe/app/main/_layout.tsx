import { BottomAppbar } from '@/components/main_screen/BottomAppbar';
import { COLORS } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainLayout() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: 60 + insets.bottom }]}>
      {/* Stack 화면 자체도 paddingBottom 적용 */}
      <Stack screenOptions={{ headerShown: false }} />

      {!keyboardVisible && (
        <View style={[styles.bottomAppbarContainer, { bottom: insets.bottom }]}>
          <BottomAppbar />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // 전체 화면 배경색 흰색
  },
  bottomAppbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
