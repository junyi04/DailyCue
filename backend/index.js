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
import {
  analyzeCustomHandler,
  analyzeWeeklyHandler,
  analyzeMonthlyHandler,
  analyzeYearlyHandler
} from './services/analysisService.js';
import { handleChatRequest, getChatHistory } from './services/chatService.js';
import { handleRecordRequest, getRecords } from './services/recordService.js';

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


/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: 커스텀 기간 분석
 *     tags: [Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 format: date
 *               to:
 *                 type: string
 *                 format: date
 *               user_id:
 *                 type: string
 *                 default: test_user
 *     responses:
 *       200:
 *         description: 분석 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/analyze', analyzeCustomHandler);

/**
 * @swagger
 * /analyze-weekly:
 *   get:
 *     summary: 주간 분석 (이번주)
 *     tags: [Analysis]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *     responses:
 *       200:
 *         description: 주간 분석 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResponse'
 */
app.get('/analyze-weekly', analyzeWeeklyHandler);

/**
 * @swagger
 * /analyze-monthly:
 *   get:
 *     summary: 월간 분석 (이번달)
 *     tags: [Analysis]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *     responses:
 *       200:
 *         description: 월간 분석 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResponse'
 */
app.get('/analyze-monthly', analyzeMonthlyHandler);

app.post('/analyze-monthly', analyzeMonthlyHandler);


/**
 * @swagger
 * /analyze-yearly:
 *   get:
 *     summary: 연간 분석 (올해)
 *     tags: [Analysis]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           default: test_user
 *     responses:
 *       200:
 *         description: 연간 분석 결과
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResponse'
 */
app.get('/analyze-yearly', analyzeYearlyHandler);

// Chatbot endpoint 
/**
 * @swagger
 * /chat:
 *   post:
 *     summary: AI 챗봇과 대화
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatMessage'
 *     responses:
 *       200:
 *         description: 챗봇 응답
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/chat', handleChatRequest);

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

// 404 handler 
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /record',
      'POST /record',
      'GET|POST /analyze',
      'POST /chat',
      'GET /chat/history'
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
  console.log('- GET|POST /analyze (Analyze records)');
  console.log('- POST /chat (Chatbot)');
  console.log('- GET  /metrics (Prometheus metrics)');
});