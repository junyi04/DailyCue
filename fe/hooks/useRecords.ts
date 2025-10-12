import { Record } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";


// 데이터 저장하고 불러올 키
export const STORAGE_KEY = '@records';

export function useRecords() {
  const [records, setRecords] = useState<Record[]>([]);

  // 앱이 시작될 때 데이터를 불러옴
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const storedRecords = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedRecords !== null) {
          setRecords(JSON.parse(storedRecords));
        }
      } catch (error) {
        console.error('기록을 가져오는데 실패했습니다.', error);
      }
    };
    loadRecords();
  }, []);

  // records 상태 변경될 때마다 데이터를 저장
  useEffect(() => {
    const saveRecords = async () => {
      try {
        const jsonValue = JSON.stringify(records);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      } catch (error) {
        console.error('기록을 저장하는데 실패했습니다.', error);
      }
    };
    saveRecords();
  }, [records]);

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
      await AsyncStorage.removeItem(STORAGE_KEY);
      setRecords([]);
    } catch (error) {
      console.error('기록을 삭제하는데 실패했습니다.', error);
    }
  };

  return { records, addRecord, clearRecords };

}