import { COLORS } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';


const { width: screenWidth } = Dimensions.get('window');

export const BottomAppbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: '홈', icon: 'home', path: '/main' },
    { name: '커뮤니티', icon: 'users', path: '/main/community' },
    { name: 'AI 챗봇', icon: 'message-circle', path: '/main/ai_partner' },
    { name: '요약', icon: 'file', path: '/main/summary' },
    { name: '설정', icon: 'settings', path: '/main/my_setting' },
  ] as const;

  return (
    <View style={styles.bottomAppBar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <Pressable
            key={tab.name}
            style={styles.personal}
            onPress={() => router.push(tab.path)}
            android_ripple={{ color: COLORS.gray, borderless: false }}            
          >
            <Feather
              name={tab.icon as any}
              size={20}
              color={isActive ? COLORS.secondary : COLORS.gray}
            />
            <Text
              style={{
                fontSize: 11,
                marginTop: 3,
                color: isActive ? COLORS.secondary : COLORS.darkGray,
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: screenWidth,
    backgroundColor: COLORS.white,
  },
  personal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
});
