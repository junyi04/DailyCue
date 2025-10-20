// Backend Server 
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// 설정 import
import { env } from './config/env.js';
import { supabase } from './config/database.js';

// 미들웨어 import
import { requestLogger } from './middleware/logging.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { metricsMiddleware, renderPrometheusMetrics } from './middleware/metrics.js';

// 서비스 import
import { handleChatRequest, getChatHistory, getSavedChartsAPI, getChartByIdAPI, deleteChartAPI, getChartStatsAPI, generateDateReportAPI } from './services/chat/chatService.js';
import { handleRecordRequest, getRecords, deleteRecord } from './services/recordService.js';
import { getPersonalizedPosts, getUserProfile, getPersonalizedCacheStatus, updatePersonalizedCacheManual } from './services/personalizedService.js';
import { getHotPosts, updateCache, getCacheStatus } from './services/HotissueService.js';
import { getNewPosts, updateNewPostsCache, getNewPostsCacheStatus } from './services/recommandService.js';

// Swagger import
import { swaggerUi, specs } from './config/swagger.js';

// Express app setup
const app = express();

// [CORS-ALL] 모든 origin 허용 (개발용, 배포 시 주석처리)
app.use(cors({ origin: true }));
app.use(express.json());

// Simple request logging 
app.use(requestLogger);
app.use(metricsMiddleware);

// Rate limiter 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use(limiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI Chat App API Documentation'
}));

// Routes (기존과 동일한 엔드포인트들)
/**
 * @swagger
 * /:
 *   get:
 *     summary: 서버 상태 확인
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 서버가 정상 작동 중
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API server is running"
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/', (req, res) => {
  res.json({
    message: 'API server is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (로깅에 표기된 엔드포인트 실제 구현)
/**
 * @swagger
 * /health:
 *   get:
 *     summary: 헬스체크 (DB 연결 상태 포함)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: 헬스체크 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 db:
 *                   type: string
 *                   example: "ok"
 *                 uptime:
 *                   type: number
 *                   description: "서버 가동 시간 (초)"
 *                 responseTimeMs:
 *                   type: number
 *                   description: "응답 시간 (밀리초)"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', async (req, res) => {
  const start = Date.now();
  let db = 'ok';
  try {
    // 가벼운 DB 연결 확인
    await supabase.from('records').select('date', { head: true, count: 'exact' }).limit(1);
  } catch (e) {
    db = 'error';
  }
  res.json({
    status: 'OK',
    db,
    uptime: process.uptime(),
    responseTimeMs: Date.now() - start,
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint (Prometheus format)
app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(renderPrometheusMetrics());
});

// Record endpoint 
/**
 * @swagger
 * /record:
 *   post:
 *     summary: 피곤함 기록 저장
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record'
 *     responses:
 *       200:
 *         description: 기록 저장 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/record', handleRecordRequest);

// Record 조회 endpoint
/**
 * @swagger
 * /record:
 *   get:
 *     summary: 사용자 기록 조회
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 기록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   fatigue:
 *                     type: number
 *                   notes:
 *                     type: string
 *                   title:
 *                     type: string
 *                   emotion:
 *                     type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/record', getRecords);

// Record 삭제 endpoint
/**
 * @swagger
 * /record/{record_id}:
 *   delete:
 *     summary: 기록 삭제
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 삭제할 기록의 ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 기록 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deletedRecord:
 *                   type: object
 *                   description: 삭제된 기록 정보
 *       404:
 *         description: 기록을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.delete('/record/:record_id', deleteRecord);



// Chatbot endpoint 
/**
 * @swagger
 * /chat:
 *   post:
 *     summary: AI 챗봇과 대화 (분석 요청 및 일반 대화 자동 구분)
 *     description: |
 *       사용자 메시지를 분석하여 자동으로 분석 요청인지 일반 대화인지 구분합니다.
 *       
 *       **분석 요청 예시:**
 *       - "한달 분석해줘"
 *       - "10월 4일부터 11월 1일까지 분석해줘"
 *       - "지난주 패턴 보여줘"
 *       
 *       **일반 대화 예시:**
 *       - "오늘 기분이 안 좋아"
 *       - "아이가 울었어"
 *       - "안녕하세요"
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *           examples:
 *             analysis_request:
 *               summary: 분석 요청
 *               value:
 *                 message: "한달 분석해줘"
 *                 user_id: "test_user"
 *             emotional_support:
 *               summary: 감정 지원 요청
 *               value:
 *                 message: "오늘 기분이 안 좋아"
 *                 user_id: "test_user"
 *             general_chat:
 *               summary: 일반 대화
 *               value:
 *                 message: "안녕하세요"
 *                 user_id: "test_user"
 *     responses:
 *       200:
 *         description: AI 응답 (분석 결과 또는 상담 응답)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *             examples:
 *               analysis_response:
 *                 summary: 분석 응답
 *                 value:
 *                   aiResponse: "한달간의 패턴을 분석한 결과..."
 *                   isAnalysis: true
 *                   analysisType: "monthly"
 *                   dateRange: "2024-02-01 ~ 2024-03-01"
 *                   chatHistory: []
 *               chat_response:
 *                 summary: 일반 대화 응답
 *                 value:
 *                   aiResponse: "오늘 기분이 안 좋으시군요. 어떤 일이 있었나요?"
 *                   isAnalysis: false
 *                   chatHistory: [...]
 *                   recordsInfo: "📊 최근 상태 요약..."
 *                   recordsUsed: true
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/chat', handleChatRequest);

// AI 추천 API 엔드포인트
app.get('/api/ai-recommend/personalized', getPersonalizedPosts);
app.get('/api/ai-recommend/hot-posts', getHotPosts);
app.get('/api/ai-recommend/new-posts', getNewPosts);

// Chat history endpoint
/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: 대화 기록 조회
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *     responses:
 *       200:
 *         description: 대화 기록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_chat:
 *                         type: string
 *                       ai_answer:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 */
app.get('/chat/history', getChatHistory);

// 차트 관련 API 엔드포인트
/**
 * @swagger
 * /charts:
 *   get:
 *     summary: 저장된 차트 목록 조회
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *         required: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 저장된 차트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 charts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       chart_name:
 *                         type: string
 *                       chart_type:
 *                         type: string
 *                       chart_data:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 */
app.get('/charts', getSavedChartsAPI);

/**
 * @swagger
 * /charts/{chartId}:
 *   get:
 *     summary: 특정 차트 조회
 *     tags: [Charts]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         schema:
 *           type: integer
 *         required: true
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *         required: true
 *     responses:
 *       200:
 *         description: 차트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chart:
 *                   type: object
 *   delete:
 *     summary: 차트 삭제
 *     tags: [Charts]
 *     parameters:
 *       - in: path
 *         name: chartId
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 default: test_user
 *             required:
 *               - user_id
 *     responses:
 *       200:
 *         description: 차트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
app.get('/charts/:chartId', getChartByIdAPI);
app.delete('/charts/:chartId', deleteChartAPI);

/**
 * @swagger
 * /charts/stats:
 *   get:
 *     summary: 차트 통계 조회
 *     tags: [Charts]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *         required: true
 *     responses:
 *       200:
 *         description: 차트 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalCharts:
 *                       type: integer
 *                     typeStats:
 *                       type: object
 *                     latestChart:
 *                       type: object
 */
app.get('/charts/stats', getChartStatsAPI);

// 날짜별 리포트 생성 API 엔드포인트
/**
 * @swagger
 * /chat/report:
 *   post:
 *     summary: 날짜별 리포트/요약 생성
 *     description: |
 *       특정 날짜의 기록과 AI 대화를 바탕으로 리포트 또는 요약을 생성합니다.
 *       
 *       **리포트 타입:**
 *       - "report": 상세한 리포트 (하루 요약, 패턴 분석, 고민사항, 개선점, 격려 메시지)
 *       - "summary": 간결한 요약 (하루 요약, 주요 패턴, 핵심 제안, 격려 메시지)
 *       
 *       **예시:**
 *       - 오늘 리포트: { "user_id": "user123", "date": "2025-01-20", "type": "report" }
 *       - 어제 요약: { "user_id": "user123", "date": "2025-01-19", "type": "summary" }
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: 사용자 ID
 *                 example: "user123"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 리포트를 생성할 날짜 (YYYY-MM-DD)
 *                 example: "2025-01-20"
 *               type:
 *                 type: string
 *                 enum: [report, summary]
 *                 default: report
 *                 description: 리포트 타입
 *                 example: "report"
 *             required:
 *               - user_id
 *               - date
 *     responses:
 *       200:
 *         description: 리포트 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 report:
 *                   type: string
 *                   description: 생성된 리포트 내용
 *                   example: "📊 하루 요약: 오늘은 피로도가 높았지만 아이와의 시간이 즐거웠습니다..."
 *                 hasData:
 *                   type: boolean
 *                   description: 해당 날짜에 데이터가 있는지 여부
 *                   example: true
 *                 recordsCount:
 *                   type: integer
 *                   description: 해당 날짜의 기록 개수
 *                   example: 3
 *                 chatCount:
 *                   type: integer
 *                   description: 해당 날짜의 채팅 개수
 *                   example: 2
 *                 date:
 *                   type: string
 *                   format: date
 *                   description: 리포트 생성 날짜
 *                   example: "2025-01-20"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "user_id와 date는 필수입니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 */
app.post('/chat/report', generateDateReportAPI);

// 404 handler 
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /record',
      'POST /record',
      'DELETE /record/:record_id',
      'GET /analyze-weekly',
      'GET /analyze-monthly', 
      'GET /analyze-yearly',
      'POST /analyze',
      'POST /chat',
      'GET /chat/history',
      'GET /charts',
      'GET /charts/:chartId',
      'DELETE /charts/:chartId',
      'GET /charts/stats',
      'POST /chat/report'
    ]
  });
});

// Global error handler 
app.use(globalErrorHandler);

// Start server 
const PORT = env.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET  / (Server status)');
  console.log('- GET  /health (Health check)');
  console.log('- GET  /api-docs (Swagger API Documentation)');
  console.log('- GET  /record (Get records)');
  console.log('- POST /record (Save record)');
  console.log('- DELETE /record/:record_id (Delete record)');
  console.log('- GET  /analyze-weekly (Weekly analysis)');
  console.log('- GET  /analyze-monthly (Monthly analysis)');
  console.log('- GET  /analyze-yearly (Yearly analysis)');
  console.log('- POST /analyze (Custom analysis)');
  console.log('- POST /chat (AI Chatbot)');
  console.log('- GET  /chat/history (Chat history)');
  console.log('- GET  /charts (Saved charts list)');
  console.log('- GET  /charts/:chartId (Get specific chart)');
  console.log('- DELETE /charts/:chartId (Delete chart)');
  console.log('- GET  /charts/stats (Chart statistics)');
  console.log('- POST /chat/report (Generate date report)');
  console.log('- GET  /metrics (Prometheus metrics)');
});