// import { COLORS, FONTS, SIZES } from '@/constants/theme';
// import React, { useEffect, useState } from 'react';
// import {
//   Image,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';

// import { COMMENTS } from '@/constants/commentContents';
// import { getTagColor } from '@/constants/tagColor';
// import { incrementView } from '@/services/postService';
// import { FontAwesome } from '@expo/vector-icons';
// import { formatDistanceToNow } from 'date-fns';
// import { useLocalSearchParams } from 'expo-router';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import CommentModal from './CommentModal';


// const PostDetail = () => {
//   const { post } = useLocalSearchParams();
//   console.log("Post param:", post);  
//   const parsedPost = post ? JSON.parse(post as string) : null;
//   console.log("Parsed Post:", parsedPost); 
  
//   const [isLiked, setIsLiked] = useState(false);
//   const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
//   const [commentText, setCommentText] = useState('');
//   const [userComments, setUserComments] = useState(COMMENTS);
//   const [viewCount, setViewCount] = useState(parsedPost ? parsedPost.view : 0);

//   const relativeDate = formatDistanceToNow(new Date(), { addSuffix: true });

//   if (!parsedPost) {
//     return <Text>포스트 없음</Text>;
//   }

//   useEffect(() => {
//     if (parsedPost) {
//       incrementView(parsedPost.id)
//         .then(() => {
//           setViewCount(viewCount + 1); // 조회수 증가
//         })
//         .catch(error => console.error('Error incrementing view count:', error));
//     }
//   }, [parsedPost]);

//   const tagColor = getTagColor(parsedPost.tag);

//   const handleLikePress = () => {
//     setIsLiked(!isLiked);
//   };

//   const handleCommentSubmit = () => {
//     if (commentText.trim()) {
//       const newComment = {
//         id: userComments.length + 100,
//         author: '비밀',
//         content: commentText,
//         createdAt: new Date().toLocaleString('ko-KR'),
//         likes: 0,
//         avatar: 'https://i.pravatar.cc/150?u=anonymous'
//       };
//       setUserComments([...userComments, newComment]);
//       setCommentText('');
//     }
//   };

//   return (
//     <SafeAreaProvider style={styles.safeArea}>
//       <SafeAreaView style={styles.container} edges={['bottom']}>
//         <StatusBar barStyle="dark-content" />
        
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//           {/* 포스트 헤더 */}
//           <View style={styles.contentWrapper}>
//             <View style={styles.tag}>
//               <Text style={[styles.tagText, { color: tagColor }]}>{parsedPost.tag}</Text>
//             </View>
//             <Text style={styles.title}>{parsedPost.title}</Text>
//             <View style={styles.profileContainer}>
//               <Image
//                 source={{ uri: `https://i.pravatar.cc/150?u=${parsedPost.user_id}` }}
//                 style={styles.avatar}
//               />
//               <View>
//                 <Text style={styles.authorName}>{parsedPost.user_id}</Text>
//                 <Text style={styles.postDate}>{relativeDate}</Text>
//               </View>
//             </View>
            
//             {/* 포스트 내용 */}
//             <View style={styles.postContainer}>
//               <Text style={styles.content}>{parsedPost.content}</Text>
//             </View>
//           </View>
//         </ScrollView>

//         {/* 공감 및 댓글 */}
//         <View style={styles.actionBar}>
//           <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
//             {isLiked
//               ? (
//                 <FontAwesome name="heart" size={20} color={'red'} />
//               ) : (
//                 <FontAwesome name="heart-o" size={20} color={COLORS.black} />
//               )}
//               {/* <Text style={styles.actionText}>{parsedPost.like_count}</Text> */}
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.actionButton} onPress={() => setIsCommentModalVisible(true)}>
//             <FontAwesome name="commenting-o" size={20} color={COLORS.black} />
//             {/* <Text style={styles.actionText}>{parsedPost.comment_count}</Text> */}
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>

//       {/* 댓글 모달 */}
//       <CommentModal
//         visible={isCommentModalVisible}
//         onClose={() => setIsCommentModalVisible(false)}
//         onSubmitComment={handleCommentSubmit}
//         userComments={userComments}
//       />
//     </SafeAreaProvider>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.white
//   },
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white
//   },
//   scrollContainer: {
//     paddingBottom: 80
//   },
//   contentWrapper: {
//     backgroundColor: COLORS.white,
//     padding: SIZES.large,
//   },
//   profileContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: SIZES.large,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     marginRight: 10,
//     backgroundColor: COLORS.lightGray
//   },
//   authorName: {
//     fontSize: 13,
//     color: COLORS.black
//   },
//   postDate: {
//     ...FONTS.h4,
//     color: COLORS.gray,
//     marginTop: 5,
//   },
//   postContainer: {
//     paddingTop: SIZES.large,
//     borderTopWidth: 0.7,
//     borderColor: COLORS.gray,
//   },
//   tag: {
//     alignSelf: 'flex-start',
//     marginBottom: SIZES.small,
//   },
//   tagText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: 'bold'
//   },
//   title: {
//     ...FONTS.h2,
//     fontWeight: 'bold',
//     color: COLORS.black,
//     marginBottom: 30,
//     lineHeight: 32
//   },
//   content: {
//     paddingTop: SIZES.small,
//     fontSize: 15,
//     color: COLORS.darkGray,
//     lineHeight: 27,
//   },
//   actionBar: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     height: 60,
//     backgroundColor: COLORS.white,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//     paddingHorizontal: 20
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     marginRight: 30
//   },
//   actionText: {
//     marginLeft: 8,
//     fontSize: 16,
//     color: COLORS.gray,
//     fontWeight: '600'
//   },

// });

// export default PostDetail;
