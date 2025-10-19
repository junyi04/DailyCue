const API_BASE_URL = 'https://emotion-2-uvlo.onrender.com';

export interface ChatRequest {
  message: string;
  user: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export const sendChatMessage = async (message: string, userId: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user: userId,
      }),
    });

    if (!response.ok) {
      throw new Error('채팅 전송에 실패했습니다.');
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};

