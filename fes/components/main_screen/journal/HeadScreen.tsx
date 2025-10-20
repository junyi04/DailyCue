// 파란 배경 쪽의 모든 뷰를 포함
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "react-native-elements";


const HeadScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.text1}>DailyCue</Text>
        <TouchableOpacity style={styles.hamburger}>
          <Ionicons name="menu" size={35} color={COLORS.darkBlueGray} />
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.leftBody}>
          <Text style={[styles.text2, { lineHeight: 50 }]}>
            데일리큐로{'\n'}기록하고{'\n'}서로 공유해요!
          </Text>
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
    marginHorizontal: 35,
    marginTop: 60,
    marginBottom: 35,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text1: {
    fontSize: 23,
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
    marginLeft: 35,
  },
  rightBody: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  text2: {
    fontSize: 25,
    color: COLORS.white,
    fontFamily: 'homeFont',
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