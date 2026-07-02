import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'API de Podcasts - Express con Swagger',
      version: '1.0.0',
      description: 'API REST con documentaciÃ³n Swagger, testing Jest y monitorizaciÃ³n Slack',
      license: {
        name: 'MIT',
        url: 'https://spdx.org/licenses/MIT.html'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        BearerToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            name: { type: 'string', example: 'Juan PÃ©rez' },
            email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
            age: { type: 'integer', example: 25 },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
          }
        },
        Podcast: {
          type: 'object',
          required: ['title', 'description', 'category', 'duration'],
          properties: {
            _id: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            title: { type: 'string', example: 'Historia de la Web' },
            description: { type: 'string', example: 'Un recorrido por la historia de Internet.' },
            author: { type: 'string', example: '65f8b3a2c9d1e20012345678' },
            category: { type: 'string', enum: ['tech', 'science', 'history', 'comedy', 'news'] },
            duration: { type: 'integer', example: 180 },
            episodes: { type: 'integer', example: 8 },
            published: { type: 'boolean', example: false }
          }
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
            password: { type: 'string', format: 'password', example: 'MiPassword123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export default swaggerJsdoc(options);

