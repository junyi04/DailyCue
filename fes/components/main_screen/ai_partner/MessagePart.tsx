import { SET_MESSAGE, createWelcomeMessages } from '@/constants/messageContents';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/config';
import { Message } from "@/types";
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from "react";
import { ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard, Dimensions } from "react-native";
import { FlatList } from 'react-native-gesture-handler';
import { supabase } from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
// 차트 라이브러리 import
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const MessagePart = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(SET_MESSAGE);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("님");
  const flatListRef = useRef<FlatList>(null);
  
  // 화면 크기 가져오기
  const screenWidth = Dimensions.get('window').width;
  
  // 최대 메시지 개수 제한
  const MAX_MESSAGES = 20;

  // 메시지 개수 제한 함수
  const limitMessages = (messageList: Message[]) => {
    if (messageList.length > MAX_MESSAGES) {
      // 최근 20개만 유지 (오래된 것부터 제거)
      return messageList.slice(-MAX_MESSAGES);
    }
    return messageList;
  };

  // 하루 초기화 확인 함수
  const checkAndResetDaily = useCallback(async () => {
    try {
      const today = new Date().toDateString(); // "Mon Jan 20 2025" 형식
      const lastResetDate = await AsyncStorage.getItem('@last_message_reset_date');
      
      if (lastResetDate !== today) {
        // 하루가 지났으면 UI 초기화
        console.log('📅 하루가 지나서 메시지 UI 초기화');
        setMessages(createWelcomeMessages(userName));
        
        // 오늘 날짜 저장
        await AsyncStorage.setItem('@last_message_reset_date', today);
      }
    } catch (error) {
      console.error('일일 초기화 확인 오류:', error);
    }
  }, [userName]);

  // 수동 초기화 함수 (디버깅용)
  const manualReset = useCallback(async () => {
    try {
      console.log('🔄 수동으로 메시지 UI 초기화');
      setMessages(createWelcomeMessages(userName));
      await AsyncStorage.setItem('@last_message_reset_date', new Date().toDateString());
    } catch (error) {
      console.error('수동 초기화 오류:', error);
    }
  }, [userName]);

  // 차트 상세 보기 함수
  const handleChartDetail = (chartData: any, chartTitle: string) => {
    router.push({
      pathname: '/main/chart_detail',
      params: {
        chartData: JSON.stringify(chartData),
        chartTitle: chartTitle
      }
    });
  };

  // 차트 렌더링 함수 (링크만 표시)
  const renderChart = (chartData: any) => {
    // 디버깅을 위한 로그
    console.log('🔍 renderChart 호출됨:', {
      chartData: chartData,
      hasType: !!chartData?.type,
      hasData: !!chartData?.data,
      dataKeys: chartData?.data ? Object.keys(chartData.data) : null,
      chartType: chartData?.type,
      dataStructure: chartData?.data ? {
        hasLabels: !!chartData.data.labels,
        hasDatasets: !!chartData.data.datasets,
        labelsLength: chartData.data.labels?.length,
        datasetsLength: chartData.data.datasets?.length
      } : null
    });
    
    // 차트 데이터가 없거나 유효하지 않은 경우
    if (!chartData || !chartData.type || !chartData.data) {
      return (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>📊 분석 차트</Text>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>차트 데이터가 없습니다.</Text>
          </View>
        </View>
      );
    }

    // 차트 타입에 따라 다른 제목 설정
    let chartTitle = '';
    switch (chartData.type) {
      case 'line':
        chartTitle = '📊 감정 변화 차트';
        break;
      case 'bar':
        chartTitle = '📊 감정 분포 차트';
        break;
      case 'pie':
        chartTitle = '📊 감정 비율 차트';
        break;
      default:
        chartTitle = '📊 분석 차트';
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{chartTitle}</Text>
        <TouchableOpacity 
          onPress={() => handleChartDetail(chartData, chartTitle)}
          style={styles.chartLink}
        >
          <Text style={styles.chartLinkText}>자세히 보기</Text>
          <Text style={styles.chartLinkIcon}>🔗</Text>
        </TouchableOpacity>
      </View>
    );
  };


  // 강제 스크롤 함수 
  const forceScrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 50);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  // 사용자 이름 가져오기
  useEffect(() => {
    const loadUserName = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUserName(profile.nickname || "님");
        }
      } catch (error) {
        console.error('사용자 이름 로드 실패:', error);
      }
    };
    
    loadUserName();
  }, []);

  // 사용자 이름이 변경되면 일일 초기화 확인
  useEffect(() => {
    if (userName !== "님") {
      checkAndResetDaily();
    }
  }, [userName, checkAndResetDaily]);

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
          .map((chat: any, index: number) => {
            // 디버깅을 위한 로그
            console.log('🔍 채팅 기록 처리:', {
              index,
              hasChartData: !!chat.chart_data,
              chartDataType: typeof chat.chart_data,
              savedChartId: chat.saved_chart_id
            });
            
            return [
              // 사용자 메시지
              {
                id: `history-${index}-user-${chat.created_at}`,
                text: chat.user_chat,
                user: true,
                createdAt: format(new Date(chat.created_at), 'p'),
              },
              // AI 응답 (차트 데이터 포함)
              {
                id: `history-${index}-ai-${chat.created_at}`,
                text: chat.ai_answer,
                user: false,
                createdAt: format(new Date(chat.created_at), 'p'),
                chartData: chat.chart_data ? (() => {
                  try {
                    // chart_data가 이미 객체인 경우와 문자열인 경우 모두 처리
                    if (typeof chat.chart_data === 'string') {
                      return JSON.parse(chat.chart_data);
                    } else if (typeof chat.chart_data === 'object') {
                      return chat.chart_data;
                    }
                    return null;
                  } catch (error) {
                    console.warn('차트 데이터 파싱 오류:', error, '데이터:', chat.chart_data);
                    return null;
                  }
                })() : null,
              }
            ];
          }).flat();
        
        // 환영 메시지 + 채팅 기록 조합
        const welcomeMessages = [...createWelcomeMessages(userName), ...formattedMessages];
        setMessages(limitMessages(welcomeMessages));
        
        // 채팅 기록 로드 후 맨 아래로 스크롤 (강제 스크롤 사용)
        forceScrollToBottom();
      } else {
        // 채팅 기록이 없으면 환영 메시지만 표시
        setMessages(limitMessages(createWelcomeMessages(userName)));
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      // 에러 시에도 환영 메시지는 표시
      setMessages(limitMessages(createWelcomeMessages(userName)));
    }
  }, [userId, userName]);

  useEffect(() => {
    // 사용자 ID가 없으면 채팅 기록을 가져오지 않음
    if (!userId) return;
    
    // 먼저 일일 초기화 확인
    checkAndResetDaily().then(() => {
      // 초기화 후 채팅 기록 로드
      fetchChatHistory();
    });
  }, [userId, fetchChatHistory, checkAndResetDaily]);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      forceScrollToBottom();
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      forceScrollToBottom();
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [forceScrollToBottom]);
  
  const onSend = useCallback(async () => {
    if (!userId) {
      // 로그인하지 않은 경우 에러 메시지 표시
      const errorMessage: Message = {
        id: `login-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: '채팅을 사용하려면 로그인이 필요합니다.',
        user: false,
        createdAt: format(new Date(), 'p'),
      };
      setMessages(prev => limitMessages([...prev, errorMessage]));
      return;
    }

    if (input.trim().length > 0) {
      const newMessage: Message = { 
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
        text: input, 
        user: true,
        createdAt: format(new Date(), 'p'), // ex) 1:15 AM
      };
      setMessages(prev => limitMessages([...prev, newMessage]));
      setInput('');
      
      // 메시지 추가 후 자동 스크롤
      forceScrollToBottom();
      
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            user_id: userId,
            recent_messages: messages.slice(-20) // 최근 20개 대화 포함
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          const aiResponse: Message = { 
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            text: data.aiResponse, 
            user: false,
            createdAt: format(new Date(), 'p'),
            chartData: data.chartData, // 차트 데이터 추가
            reportData: data.reportData, // 리포트 데이터 추가
          };
          setMessages(prev => limitMessages([...prev, aiResponse]));
          
          // AI 응답 후 자동 스크롤
          forceScrollToBottom();
        } else {
          // 에러 발생 시 사용자에게 알림
          const errorMessage: Message = {
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.',
            user: false,
            createdAt: format(new Date(), 'p'),
          };
          setMessages(prev => limitMessages([...prev, errorMessage]));
          forceScrollToBottom();
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage: Message = {
          id: `network-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          user: false,
          createdAt: format(new Date(), 'p'),
        };
        setMessages(prev => limitMessages([...prev, errorMessage]));
        forceScrollToBottom();
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
            {/* 차트 표시 */}
            {item.chartData && renderChart(item.chartData)}
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
  chartContainer: {
    marginTop: SIZES.small,
    padding: SIZES.small,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  chartTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: COLORS.white,
    padding: SIZES.small,
    borderRadius: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  chartText: {
    ...FONTS.body,
    color: COLORS.black,
    marginBottom: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  chartLinkText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 8,
  },
  chartLinkIcon: {
    fontSize: 16,
  },
})

export default MessagePart;