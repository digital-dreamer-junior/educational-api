const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Basic Swagger Definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Educational API Documentation',
    version: '1.0.0',
    description: 'API documentation for Educational Platform',
    contact: {
      name: 'API Support',
      email: 'moohammade.dev@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.example.com/api/v1',
      description: 'Production Server',
    },
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Error message here',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          username: {
            type: 'string',
            example: 'johndoe',
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          phone: {
            type: 'string',
            example: '09123456789',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'instructor'],
            example: 'user',
          },
        },
      },
      Course: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            example: 'Introduction to Programming',
          },
          description: {
            type: 'string',
            example: 'Learn the basics of programming',
          },
          price: {
            type: 'number',
            example: 99.99,
          },
          instructor: {
            $ref: '#/components/schemas/User',
          },
          category: {
            $ref: '#/components/schemas/Category',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            example: 'Programming',
          },
          slug: {
            type: 'string',
            example: 'programming',
          },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          review: {
            type: 'string',
            example: 'Great course!',
          },
          rating: {
            type: 'number',
            minimum: 1,
            maximum: 5,
            example: 5,
          },
          user: {
            $ref: '#/components/schemas/User',
          },
          course: {
            $ref: '#/components/schemas/Course',
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
  },
  tags: [
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Courses',
      description: 'Course management endpoints',
    },
    {
      name: 'Categories',
      description: 'Category management endpoints',
    },
    {
      name: 'Reviews',
      description: 'Review management endpoints',
    },
    {
      name: 'Enrollments',
      description: 'Enrollment management endpoints',
    },
    {
      name: 'Contact',
      description: 'Contact form and message management endpoints',
    },
    {
      name: 'Newsletters',
      description: 'Newsletter subscription management endpoints',
    },
    {
      name: 'Tickets',
      description: 'Support ticket management endpoints',
    },
    {
      name: 'Search',
      description: 'Search functionality endpoints',
    },
    {
      name: 'Notifications',
      description: 'Notification management endpoints',
    },
    {
      name: 'Discount Codes',
      description: 'Discount code management endpoints',
    },
  ],
};

// Swagger Options
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/v1/*.js')],
  explorer: true,
};

// Initialize Swagger Docs
const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Educational Platform API Documentation',
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions,
};
