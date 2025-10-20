// 개발 환경 (Render 서버 사용)
const DEV_API_URL = 'https://emotions-e598.onrender.com';
// 프로덕션 환경 (Render)
const PROD_API_URL = 'https://emotions-e598.onrender.com';

// 현재 환경에 따라 API URL 설정
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;