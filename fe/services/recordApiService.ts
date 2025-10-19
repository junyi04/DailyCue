import { API_BASE_URL } from '@/constants/config';

export interface RecordData {
  user_id: string;
  date: string;
  fatigue: number;
  notes: string;
  title: string;
  emotion: string;
}

export interface RecordResponse {
  success: boolean;
  data: any;
}

export const recordApiService = {
  // 기록 저장
  async saveRecord(recordData: RecordData): Promise<RecordResponse> {
    try {
      console.log('🌐 API 호출 시작:', `${API_BASE_URL}/record`);
      console.log('📦 요청 데이터:', recordData);

      const response = await fetch(`${API_BASE_URL}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      console.log('📡 응답 상태:', response.status, response.statusText);
      console.log('📡 응답 헤더:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 서버 에러 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 성공 응답:', result);
      return result;
    } catch (error) {
      console.error('❌ 기록 저장 실패:', error);
      throw error;
    }
  },

  // 기록 조회 (사용자별)
  async getRecords(userId: string): Promise<any[]> {
    try {
      console.log('🌐 기록 조회 API 호출:', `${API_BASE_URL}/record?user_id=${userId}`);

      const response = await fetch(`${API_BASE_URL}/record?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 기록 조회 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 기록 조회 서버 에러:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 기록 조회 성공:', result);
      return result; // 백엔드에서 직접 배열을 반환하므로 result.data가 아님
    } catch (error) {
      console.error('❌ 기록 조회 실패:', error);
      throw error;
    }
  }
};
