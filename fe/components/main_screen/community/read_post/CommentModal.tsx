import { COLORS } from '@/constants/theme';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitComment: (commentText: string) => void;
  userComments: any[];
  currentUserName: string;
}

const CommentModal = ({
  visible,
  onClose,
  onSubmitComment,
  userComments,
}: CommentModalProps) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    onSubmitComment(trimmed);
    setCommentText('');
  };

  // 댓글의 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 172800) return '하루 전';
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const CommentItem = ({ comment }: { comment: any }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentAuthor}>{comment.author}</Text>
      <Text style={styles.commentText}>{comment.content}</Text>
      <Text style={styles.commentDate}>{formatTimeAgo(comment.created_at)}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.modalCancelButton}>취소</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>댓글</Text>
              <TouchableOpacity onPress={handleSubmit}>
                <Text style={styles.modalSubmitButton}>등록</Text>
              </TouchableOpacity>
            </View>

            {/* 댓글 목록 */}
            <ScrollView style={styles.modalCommentsContainer}>
              {userComments.length === 0 ? (
                <Text style={styles.noCommentText}>아직 댓글이 없습니다</Text>
              ) : (
                userComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </ScrollView>

            {/* 입력창 */}
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalCommentInput}
                placeholder="댓글을 입력해주세요"
                multiline
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={styles.modalSendButton} onPress={handleSubmit}>
                <Text style={styles.modalSendButtonText}>등록</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalCancelButton: { 
    fontSize: 16, 
    color: COLORS.gray 
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#22c55e' 
  },
  modalSubmitButton: { 
    fontSize: 16, 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  modalCommentsContainer: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  noCommentText: { 
    textAlign: 'center', 
    marginTop: 30, 
    color: COLORS.gray 
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  modalCommentInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    minHeight: 40,
  },
  modalSendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalSendButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
});

export default CommentModal;
