// 파란 배경 쪽의 모든 뷰를 포함
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { router, useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";


const HeadScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.text1}>DailyCue</Text>
        <TouchableOpacity style={styles.hamburger} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={35} color={COLORS.darkBlueGray} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.leftBody}>
          <Text style={styles.text2}>{`데일리큐로\n기록하고\n서로 공유해요!`}</Text>
          <TouchableOpacity style={styles.goChat} onPress={() => router.push('/main/ai-partner')}>
            <Ionicons name="chatbubbles-outline" size={SIZES.medium} color={COLORS.secondary} />
            <Text style={styles.text3}>ai 채팅가기</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rightBody}>
          <Image
            source={require('@/assets/images/family.png')}
            style={styles.image}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginTop: 50,
    marginBottom: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text1: {
    ...FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.darkBlueGray,
  },
  hamburger: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftBody: {
    marginLeft: 30,
  },
  rightBody: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  text2: {
    fontSize: 30,
    fontWeight: '500',
    color: COLORS.white,
  },
  goChat: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: SIZES.large,
    backgroundColor: COLORS.white,
    gap: 5,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  text3: {
    ...FONTS.body,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  image: {
    width: 150, 
    height: 150, 
  },
});

export default HeadScreen;