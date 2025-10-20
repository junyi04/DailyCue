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
              description: '사용자 메시지 (분석 요청 또는 일반 대화)',
              example: '한달 분석해줘'
            },
            user_id: {
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
            aiResponse: {
              type: 'string',
              description: 'AI 응답'
            },
            chatHistory: {
              type: 'array',
              description: '대화 기록',
              items: {
                type: 'object',
                properties: {
                  user_chat: {
                    type: 'string'
                  },
                  ai_answer: {
                    type: 'string'
                  }
                }
              }
            },
            recordsInfo: {
              type: 'string',
              description: '기록 정보 (분석 요청 시)'
            },
            isAnalysis: {
              type: 'boolean',
              description: '분석 요청 여부'
            },
            analysisType: {
              type: 'string',
              description: '분석 유형 (monthly, weekly, custom 등)',
              example: 'monthly'
            },
            dateRange: {
              type: 'string',
              description: '분석 기간',
              example: '2024-02-01 ~ 2024-03-01'
            },
            recordsUsed: {
              type: 'boolean',
              description: '기록 데이터 사용 여부'
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