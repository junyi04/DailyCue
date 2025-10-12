import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat App API',
      version: '1.0.0',
      description: '감정 케어 AI 챗봇 API 문서',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://emotions-e598.onrender.com',
        description: 'Production server',
      }
    ],
    components: {
      schemas: {
        Record: {
          type: 'object',
          required: ['user_id', 'date', 'fatigue'],
          properties: {
            user_id: {
              type: 'string',
              description: '사용자 ID',
              example: 'test_user'
            },
            date: {
              type: 'string',
              format: 'date',
              description: '기록 날짜 (YYYY-MM-DD)',
              example: '2024-01-15'
            },
            fatigue: {
              type: 'integer',
              minimum: 1,
              maximum: 10,
              description: '피곤함 정도 (1-10)',
              example: 7
            },
            title: {
              type: 'string',
              description: '기록의 제목',
              example: '오늘의 감정 기록'
            },
            notes: {
              type: 'string',
              description: '기록의 내용(메모)',
              example: '아이가 많이 울어서 힘들었음'
            }
          }
        },
        AnalysisRequest: {
          type: 'object',
          oneOf: [
            {
              required: ['range'],
              properties: {
                range: {
                  type: 'string',
                  enum: ['daily', 'weekly', 'monthly'],
                  description: '분석 기간'
                },
                user_id: {
                  type: 'string',
                  default: 'test_user'
                }
              }
            },
            {
              required: ['from', 'to'],
              properties: {
                from: {
                  type: 'string',
                  format: 'date',
                  description: '시작 날짜'
                },
                to: {
                  type: 'string',
                  format: 'date',
                  description: '종료 날짜'
                },
                user_id: {
                  type: 'string',
                  default: 'test_user'
                }
              }
            }
          ]
        },
        AnalysisResponse: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              description: 'AI 분석 결과'
            },
            cached: {
              type: 'boolean',
              description: '캐시된 결과 여부'
            }
          }
        },
        ChatMessage: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              description: '사용자 메시지',
              example: '오늘 기분이 어떤지 분석해줘'
            },
            user: {
              type: 'string',
              description: '사용자 ID',
              default: 'test_user',
              example: 'test_user'
            }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            response: {
              type: 'string',
              description: 'AI 응답'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 메시지'
            },
            details: {
              type: 'string',
              description: '상세 에러 정보'
            }
          }
        }
      }
    }
  },
  apis: ['./index.js', './services/*.js'], // API 문서를 추출할 파일 경로
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };