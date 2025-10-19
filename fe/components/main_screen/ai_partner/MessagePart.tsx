"use client"

import { API_BASE_URL } from "@/constants/config"
import { SET_MESSAGE } from "@/constants/messageContents"
import { COLORS, FONTS, SIZES } from "@/constants/theme"
import { supabase } from "@/lib/supabase"
import type { Message } from "@/types"
import { Feather } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { format } from "date-fns"
import { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, type ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"

const CHAT_CACHE_KEY = "chat_history_cache"

const MessagePart = () => {
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const flatListRef = useRef<FlatList>(null)

  // 현재 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Error getting user:", error.message)
          return
        }
        if (user) {
          setUserId(user.id)
        }
      } catch (error) {
        console.error("Error in getCurrentUser:", error)
      }
    }

    getCurrentUser()
  }, [])

  // 캐시에서 채팅 기록 불러오기
  const loadCachedMessages = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(`${CHAT_CACHE_KEY}_${userId}`)
      if (cached) {
        const cachedMessages = JSON.parse(cached)
        setMessages(cachedMessages)
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to load cached messages:", error)
      return false
    }
  }, [userId])

  // 캐시에 채팅 기록 저장하기
  const saveCachedMessages = useCallback(
    async (messagesToCache: Message[]) => {
      try {
        await AsyncStorage.setItem(`${CHAT_CACHE_KEY}_${userId}`, JSON.stringify(messagesToCache))
      } catch (error) {
        console.error("Failed to save cached messages:", error)
      }
    },
    [userId],
  )

  // 이전 대화 기록 불러오기
  const fetchChatHistory = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)

    // 먼저 캐시된 메시지 로드
    const hasCached = await loadCachedMessages()

    try {
      const response = await fetch(`${API_BASE_URL}/chat/history?user_id=${userId}`)
      const data = await response.json()

      if (response.ok && data.chatHistory && data.chatHistory.length > 0) {
        const sortedHistory = data.chatHistory.sort(
          (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )

        const formattedMessages: Message[] = sortedHistory.flatMap((chat: any, index: number) => [
          {
            id: `history-${index}-user-${chat.created_at}`,
            text: chat.user_chat,
            user: true,
            createdAt: format(new Date(chat.created_at), "p"),
          },
          {
            id: `history-${index}-ai-${chat.created_at}`,
            text: chat.ai_answer,
            user: false,
            createdAt: format(new Date(chat.created_at), "p"),
          },
        ])

        setMessages(formattedMessages)
        await saveCachedMessages(formattedMessages)

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      } else if (!hasCached) {
        // 채팅 기록도 없고 캐시도 없으면 환영 메시지 표시
        setMessages(SET_MESSAGE)
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
      // 네트워크 오류 시 캐시된 메시지가 없으면 환영 메시지 표시
      if (!hasCached) {
        setMessages(SET_MESSAGE)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, loadCachedMessages, saveCachedMessages])

  useEffect(() => {
    if (!userId) return
    fetchChatHistory()
  }, [userId, fetchChatHistory])

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages, isLoading])

  const onSend = useCallback(async () => {
    if (!userId) {
      const errorMessage: Message = {
        id: `login-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: "채팅을 사용하려면 로그인이 필요합니다.",
        user: false,
        createdAt: format(new Date(), "p"),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    if (input.trim().length > 0) {
      const newMessage: Message = {
        id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: input,
        user: true,
        createdAt: format(new Date(), "p"),
      }
      const updatedMessages = [...messages, newMessage]
      setMessages(updatedMessages)
      setInput("")

      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            user_id: userId,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          const aiResponse: Message = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: data.aiResponse,
            user: false,
            createdAt: format(new Date(), "p"),
          }
          const finalMessages = [...updatedMessages, aiResponse]
          setMessages(finalMessages)
          await saveCachedMessages(finalMessages)
        } else {
          const errorMessage: Message = {
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: "죄송합니다. 메시지 전송 중 오류가 발생했습니다.",
            user: false,
            createdAt: format(new Date(), "p"),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      } catch (error) {
        console.error("Chat error:", error)
        const errorMessage: Message = {
          id: `network-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          user: false,
          createdAt: format(new Date(), "p"),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    }
  }, [input, userId, messages, saveCachedMessages])

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
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.loadingText}>채팅 기록을 불러오는 중...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SIZES.medium, flexGrow: 1, justifyContent: "flex-end" }}
        style={{ flex: 1 }}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.pageBackground,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.darkBlueGray,
    marginTop: SIZES.medium,
  },
  time: {
    fontSize: 10,
  },
  user: {
    maxWidth: "90%",
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  ai: {
    maxWidth: "90%",
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "flex-end",
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
    flexDirection: "row",
    paddingHorizontal: SIZES.small,
    alignItems: "flex-end",
    paddingBottom: 35,
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SIZES.small,
  },
})

export default MessagePart