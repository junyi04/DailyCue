import { Message } from "@/types";

// 사용자 이름을 받아서 환영 메시지 생성하는 함수
export const createWelcomeMessages = (userName: string = "님"): Message[] => [
  { 
    id: '1', 
    text: `${userName}님의 기록을 보니 지난주보다 스트레스 관리를 더 잘하고 계시네요!`, 
    user: false,
    createdAt: ''
  },
  { 
    id: '2', 
    text: '안녕하세요, 오늘 하루는 어떠셨나요?', 
    user: false,
    createdAt: '' 
  },
];

// 기본 환영 메시지 (이름 없이)
export const SET_MESSAGE: Message[] = createWelcomeMessages("님");