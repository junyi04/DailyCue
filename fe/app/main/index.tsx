// 홈 화면
import Button from '@/components/main_screen/journal/Button';
import HeadScreen from '@/components/main_screen/journal/HeadScreen';
import SavedRecords from '@/components/main_screen/journal/SavedReords';
import { COLORS } from '@/constants/theme';
import { STORAGE_KEY, useRecords } from '@/hooks/useRecords';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View } from 'react-native';


export default function JournalScreen() {
  const [records, setRecords] = useState([]);

  // 주석 풀지마세요.
  // const { clearRecords } = useRecords();
  // clearRecords()

  useFocusEffect(
    useCallback(() => {
      const fetchRecords = async () => {
        try {
          const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedRecords !== null) {
            setRecords(JSON.parse(storedRecords));
          }
        } catch (error) {
          console.error('기록을 가져오는데 실패했습니다.', error);
        }
      }

      fetchRecords();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.secondary, COLORS.pageBackground]} 
        locations={[0.3, 0.7]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.head}>
        <HeadScreen />
      </View>
      <View style={styles.body}>
        <Button count={records.length}/>
        <SavedRecords 
          records={records} // records 배열 형식으로 데이터를 전해줌.
        />
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  head: {
    height: 335,
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});