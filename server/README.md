# CodeMaster Backend

A comprehensive backend for a LeetCode-style coding platform built with Node.js, Express, and MongoDB.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Session management

### 👤 User Management
- User profiles with statistics
- Streak tracking and visualization
- Achievement system
- Settings management (theme, preferences)
- Topic selection and progress tracking
- Leaderboard system

### 📝 Problem Management
- CRUD operations for coding problems
- Multiple difficulty levels (Easy, Medium, Hard)
- Topic categorization
- Test case management
- Code templates for multiple languages
- Problem statistics and analytics

### 🏃‍♂️ Code Execution
- Secure code execution environment
- Support for JavaScript, Python, Java, C++, TypeScript
- Real-time test case validation
- Runtime and memory tracking
- Error handling and timeout management

### 📊 Submission System
- Code submission and evaluation
- Submission history
- Performance metrics
- Test case results
- Status tracking (Accepted, Wrong Answer, etc.)

### 🏆 Achievement System
- Dynamic achievement checking
- Multiple achievement categories
- Points and ranking system
- Progress tracking

### 📚 Topic Management
- Structured learning paths
- Prerequisites system
- Progress tracking per topic
- Problem organization by topics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/settings` - Update user settings
- `PUT /api/users/topics` - Update selected topics
- `GET /api/users/streak` - Get streak data
- `GET /api/users/leaderboard` - Get leaderboard
- `DELETE /api/users/account` - Delete account

### Problems
- `GET /api/problems` - Get all problems (with filters)
- `GET /api/problems/:slug` - Get single problem
- `GET /api/problems/:id/template/:language` - Get code template
- `POST /api/problems` - Create problem (Admin)
- `PUT /api/problems/:id` - Update problem (Admin)
- `DELETE /api/problems/:id` - Delete problem (Admin)

### Submissions
- `POST /api/submissions` - Submit code
- `POST /api/submissions/run` - Run code (test)
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get single submission

### Topics
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get single topic
- `POST /api/topics` - Create topic (Admin)
- `PUT /api/topics/:id` - Update topic (Admin)

### Achievements
- `GET /api/achievements` - Get all achievements
- `GET /api/achievements/user` - Get user achievements
- `POST /api/achievements` - Create achievement (Admin)

### Code Execution
- `POST /api/execute/run` - Execute code with custom input

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Python 3.x (for Python code execution)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/codemaster
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Start MongoDB:**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Seed the database:**
   ```bash
   node scripts/seedData.js
   ```

5. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## Database Schema

### User Model
- Personal information (name, email, avatar)
- Authentication data (password hash)
- Statistics (problems solved, streak, rank)
- Settings and preferences
- Solved problems history
- Achievements earned
- Selected topics

### Problem Model
- Problem details (title, description, difficulty)
- Examples and constraints
- Test cases (public and hidden)
- Code templates for multiple languages
- Statistics (acceptance rate, submissions)
- Topic categorization

### Submission Model
- User and problem references
- Code and language
- Execution results
- Test case outcomes
- Performance metrics

### Achievement Model
- Achievement details and criteria
- Points and rarity system
- Category classification

### Topic Model
- Topic information and metadata
- Prerequisites system
- Associated problems
- Progress tracking

## Security Features

- **Input Validation:** Express-validator for request validation
- **Rate Limiting:** Protection against brute force attacks
- **Helmet:** Security headers
- **CORS:** Cross-origin resource sharing configuration
- **JWT:** Secure token-based authentication
- **Password Hashing:** bcrypt for password security
- **Code Execution Security:** Sandboxed execution environment

## Code Execution Security

The code execution service implements several security measures:

- **Timeout Protection:** 5-second execution limit
- **Memory Limits:** 128MB memory restriction
- **Sandboxed Environment:** VM2 for JavaScript isolation
- **Input Sanitization:** Proper input parsing and validation
- **Error Handling:** Comprehensive error catching and reporting

## Performance Optimizations

- **Database Indexing:** Optimized queries with proper indexes
- **Pagination:** Efficient data loading for large datasets
- **Caching:** Strategic caching for frequently accessed data
- **Connection Pooling:** MongoDB connection optimization

## Monitoring and Logging

- **Error Logging:** Comprehensive error tracking
- **Performance Monitoring:** Runtime and memory tracking
- **Health Checks:** System status endpoints
- **Request Logging:** API usage tracking

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t codemaster-backend .

# Run container
docker run -p 5000:5000 -e MONGODB_URI=mongodb://host.docker.internal:27017/codemaster codemaster-backend
```

### Production Considerations
- Use environment variables for all configuration
- Set up proper logging and monitoring
- Configure reverse proxy (nginx)
- Set up SSL/TLS certificates
- Use process managers (PM2)
- Configure database backups
- Set up CI/CD pipelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details