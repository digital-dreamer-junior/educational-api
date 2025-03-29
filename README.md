# Educational API

This project is an educational API built with Node.js and Express.js.

## Project Features

- MVC Architecture
- Express.js Framework
- Authentication System
- Error Handling
- Data Validation
- Environment Configuration

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

## Installation & Setup

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

- Create a `config.env` file in the root directory
- Set up the required environment variables

4. Run the project:

```bash
npm start
```

## Project Structure

```
├── configs/         # Project configurations
├── controllers/     # Route controllers
├── middlewares/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── validators/     # Data validators
├── app.js          # Main application file
└── server.js       # Server configuration
```

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register

Register a new user

- Request Body:
  ```json
  {
    "username": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "password": "string",
    "passwordConfirm": "string"
  }
  ```
- Response: JWT token and user data

#### POST /api/v1/auth/login

Login user with email/phone and password

- Request Body:
  ```json
  {
    "identifier": "string (email or phone)",
    "password": "string"
  }
  ```
- Response: JWT token and user data

#### GET /api/v1/auth/logout

Logout user

- Headers: Authorization: Bearer <token>
- Response: Success message

### User Endpoints

#### GET /api/v1/users

Get all users (Protected route - Admin only)

- Headers: Authorization: Bearer <token>
- Response: Array of users

#### GET /api/v1/users/:id

Get user by ID (Protected route)

- Headers: Authorization: Bearer <token>
- Response: User object

#### PATCH /api/v1/users/updateMe

Update current user's data (Protected route)

- Headers: Authorization: Bearer <token>
- Request Body:
  ```json
  {
    "name": "string",
    "email": "string",
    "username": "string",
    "phone": "string",
    "photo": "file (optional)"
  }
  ```
- Response: Updated user data

#### DELETE /api/v1/users/deleteMe

Deactivate current user account (Protected route)

- Headers: Authorization: Bearer <token>
- Response: Success message

#### POST /api/v1/users/:id/ban

Ban a user (Protected route - Admin only)

- Headers: Authorization: Bearer <token>
- Response: Success message

### Course Endpoints

#### GET /api/v1/courses

Get all courses

- Query Parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
  - sort: Sort field (default: -createdAt)
  - fields: Fields to return
- Response: Array of courses with pagination

#### GET /api/v1/courses/:id

Get course by ID

- Response: Course object

#### POST /api/v1/courses

Create new course (Protected route - Admin only)

- Headers: Authorization: Bearer <token>
- Request Body:
  ```json
  {
    "title": "string",
    "description": "string",
    "price": "number",
    "duration": "string",
    "level": "string",
    "category": "string"
  }
  ```
- Response: Created course

### Enrollment Endpoints

#### POST /api/v1/enrollments

Enroll in a course (Protected route)

- Headers: Authorization: Bearer <token>
- Request Body:
  ```json
  {
    "courseId": "string"
  }
  ```
- Response: Enrollment data

#### GET /api/v1/enrollments

Get user's enrollments (Protected route)

- Headers: Authorization: Bearer <token>
- Response: Array of enrollments

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JWT for Authentication
- Express Validator
- Morgan for Logging
- Nodemon for Development
- Multer for File Uploads
- Sharp for Image Processing

## Error Handling

The API implements a centralized error handling system with the following features:

- Custom error classes
- Global error middleware
- Validation error handling
- Authentication error handling
- File upload error handling

## Security Features

- JWT Authentication
- Password Hashing
- Request Rate Limiting
- CORS Configuration
- Security Headers
- File Upload Validation
- Input Sanitization

## Development Guidelines

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Use JSDoc for function documentation

### Testing

- Unit tests for controllers
- Integration tests for API endpoints
- Test coverage requirements
- Error handling tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

[Your Name] - [your.email@example.com]

Project Link: [https://github.com/yourusername/educational-api](https://github.com/yourusername/educational-api)
