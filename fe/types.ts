// 커뮤니티 게시글
export interface Post {
  id: string;
  user_id: string;
  tag: '전체' | '공유해요' | '공감원해요' | '함께해요' | '고수찾아요';
  title: string;
  content: string;
  views: number;
  like_count: number;
  comment_count: number;
  created_at: string;
}

// AI 챗봇 메시지 타입
export interface Message {
  id: string;
  text: string;
  user: boolean; // true: 사용자, false: AI
  createdAt: string;
}

// 기록
export interface Record {
  id: string;
  emoji: '😍' | '😆' | '😯' | '😐' | '😭' | '😡',
  title: string;
  content: string;
  createdAt: string;
} 