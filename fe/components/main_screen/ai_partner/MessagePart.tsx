import { API_BASE_URL } from '@/constants/config';
import { SET_MESSAGE } from '@/constants/messageContents';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { supabase } from "@/lib/supabase";
import { Message } from "@/types";
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from "react";
import { ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from 'react-native-gesture-handler';

const MessagePart = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(SET_MESSAGE);
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error.message);
          return;
        }
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error in getCurrentUser:', error);
      }
    };

    getCurrentUser();
  }, []);
  
  // 이전 대화 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history?user_id=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.chatHistory) {
        // 시간순으로 정렬 (과거 → 현재)
        const sortedHistory = data.chatHistory.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        const formattedMessages: Message[] = sortedHistory
          .map((chat: any, index: number) => [
            // 사용자 메시지
            {
              id: `history-${index}-user-${chat.created_at}`,
              text: chat.user_chat,
              user: true,
              createdAt: format(new Date(chat.created_at), 'p'),
            },
            // AI 응답
            {
              id: `history-${index}-ai-${chat.created_at}`,
              text: chat.ai_answer,
              user: false,
              createdAt: format(new Date(chat.created_at), 'p'),
            }
          ]).flat();
        
        setMessages(formattedMessages);
        
        // 채팅 기록 로드 후 맨 아래로 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  }, [userId]);

  useEffect(() => {
    // 사용자 ID가 없으면 채팅 기록을 가져오지 않음
    if (!userId) return;
    fetchChatHistory();
  }, [userId, fetchChatHistory]);
  
  const onSend = useCallback(async () => {
    if (!userId) {
      // 로그인하지 않은 경우 에러 메시지 표시
      const errorMessage: Message = {
        id: `login-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: '채팅을 사용하려면 로그인이 필요합니다.',
        user: false,
        createdAt: format(new Date(), 'p'),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (input.trim().length > 0) {
      const newMessage: Message = { 
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        text: input, 
        user: true,
        createdAt: format(new Date(), 'p'), // ex) 1:15 AM
      };
      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            user_id: userId
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          const aiResponse: Message = { 
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            text: data.aiResponse, 
            user: false,
            createdAt: format(new Date(), 'p'),
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // 에러 발생 시 사용자에게 알림
          const errorMessage: Message = {
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.',
            user: false,
            createdAt: format(new Date(), 'p'),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: `network-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          user: false,
          createdAt: format(new Date(), 'p'),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, [input, userId]);

  const renderItem: ListRenderItem<Message> = ({ item }) => (
    <View>
      {item.user ? (
        <View style={styles.user}>
          <Text style={styles.time}>{item.createdAt}</Text>
          <View style={styles.userMessageContainer}>
            <Text style={styles.userMessageText}>{item.text}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.ai}>
          <View style={styles.aiMessageContainer}>
            <Text style={styles.aiMessageText}>{item.text}</Text>
          </View>
          <Text style={styles.time}>{item.createdAt}</Text>
        </View>
      )}
    </View>
  );
  
  return (
    <View style= {{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: SIZES.medium, flexGrow: 1, justifyContent: 'flex-end' }}
        style={{ flex: 1 }}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          multiline
          placeholder="메시지 입력"
          placeholderTextColor={COLORS.darkBlueGray}
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
          <Feather name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  time: {
    fontSize: 10,
  },
  user: { 
    maxWidth: '90%', 
    flexDirection: 'row', 
    alignSelf: 'flex-end', 
    alignItems: 'flex-end',
  },
  ai: { 
    maxWidth: '90%', 
    flexDirection: 'row', 
    alignSelf: 'flex-start', 
    alignItems: 'flex-end' 
  },
  userMessageContainer: {
    backgroundColor: COLORS.secondary,
    borderBottomRightRadius: 0,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 10,
    borderRadius: SIZES.medium,
    marginTop: SIZES.small,
    marginLeft: 5,
    flexShrink: 1,
  },
  aiMessageContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 0.3,
    borderColor: COLORS.gray,
    borderBottomLeftRadius: 0,
    paddingHorizontal: SIZES.medium,
    paddingVertical: 10,
    borderRadius: SIZES.medium,
    marginTop: SIZES.small,
    marginRight: 5,
    flexShrink: 1,
  },
  userMessageText: { 
    ...FONTS.body, 
    color: COLORS.white,
  },
  aiMessageText: { 
    ...FONTS.body, 
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.small,
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingTop: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    paddingHorizontal: SIZES.medium,
    ...FONTS.body,
    minHeight: 40,
    maxHeight: 85,
  },
  sendButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SIZES.small,
  },
})

export default MessagePart;