import { SET_MESSAGE } from '@/constants/messageContents';
import { COLORS, FONTS, SIZES } from '@/constants/theme';
import { Message } from "@/types";
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useCallback, useState } from "react";
import { ListRenderItem, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from 'react-native-gesture-handler';

const MessagePart = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>(SET_MESSAGE);
  
  const onSend = useCallback(() => {
    if (input.trim().length > 0) {
      const newMessage: Message = { 
        id: Date.now().toString(), 
        text: input, 
        user: true,
        createdAt: format(new Date(), 'p'), // ex) 1:15 AM
      };
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
      
      setTimeout(() => {
        const aiResponse: Message = { 
          id: (Date.now() + 1).toString(), 
          text: '조금 더 자세히 말씀해주시겠어요?', 
          user: false,
          createdAt: format(new Date(), 'p'),
        };
        setMessages(prev => [aiResponse, ...prev]);
      }, 1000);
    }
  }, [input]);

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
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={{ padding: SIZES.medium, flexGrow: 1, justifyContent: 'flex-end' }}
        style={{ flex: 1 }}
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
    paddingVertical: 10,
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