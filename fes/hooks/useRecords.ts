import { Record } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";


// 데이터 저장하고 불러올 키
// 사용자별로 다른 키를 생성하는 함수
export const getStorageKey = (userId: string) => `@records_${userId}`;

export function useRecords(userId: string = 'default') {
  const [records, setRecords] = useState<Record[]>([]);
  const storageKey = getStorageKey(userId);

  // 앱이 시작될 때 데이터를 불러옴
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const storedRecords = await AsyncStorage.getItem(storageKey);
        if (storedRecords !== null) {
          setRecords(JSON.parse(storedRecords));
        }
      } catch (error) {
        console.error('기록을 가져오는데 실패했습니다.', error);
      }
    };
    loadRecords();
  }, [storageKey]);

  // records 상태 변경될 때마다 데이터를 저장
  useEffect(() => {
    const saveRecords = async () => {
      try {
        const jsonValue = JSON.stringify(records);
        await AsyncStorage.setItem(storageKey, jsonValue);
      } catch (error) {
        console.error('기록을 저장하는데 실패했습니다.', error);
      }
    };
    saveRecords();
  }, [records, storageKey]);

  const addRecord = (newRecord: Omit<Record, 'id'>) => {
    setRecords(prev => {
      const newEntry: Record = {
        ...newRecord,
        id: Date.now().toString(),
      };
      return [newEntry, ...prev];
    });
  };

  // 모든 기록을 삭제하는 함수
  const clearRecords = async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
      setRecords([]);
    } catch (error) {
      console.error('기록을 삭제하는데 실패했습니다.', error);
    }
  };

  return { records, addRecord, clearRecords };

}