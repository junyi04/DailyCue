import axios from 'axios';

async function testChat() {
  try {
    console.log('🚀 챗봇 테스트 시작...');
    
    const response = await axios.post('http://localhost:5001/chat', {
      message: '내 기록을 분석해줘',
      user_id: 'test_user'
    });
    
    console.log('📊 응답 상태:', response.status);
    console.log('📊 응답 데이터:');
    console.log('  - aiResponse 길이:', response.data.aiResponse?.length || 0);
    console.log('  - chatHistory 개수:', response.data.chatHistory?.length || 0);
    console.log('  - recordsInfo 있음:', !!response.data.recordsInfo);
    console.log('  - filteringStats 있음:', !!response.data.filteringStats);
    
    if (response.data.recordsInfo) {
      console.log('📊 recordsInfo 미리보기:');
      console.log(response.data.recordsInfo.substring(0, 300) + '...');
    }
    
    if (response.data.filteringStats) {
      console.log('📊 filteringStats:');
      console.log(JSON.stringify(response.data.filteringStats, null, 2));
    }
    
    console.log('✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

testChat();
