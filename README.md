# CodeMaster - Complete LeetCode-style Coding Platform

A comprehensive full-stack coding platform with React frontend and Node.js backend, featuring code execution, problem management, user progress tracking, and more.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX** with Tailwind CSS and dark mode support
- **Code Editor** with syntax highlighting and multiple language support
- **Real-time Test Cases** execution and results
- **User Authentication** and profile management
- **Progress Tracking** with streaks and statistics
- **Topic-based Learning** with structured curriculum
- **Responsive Design** for all devices

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **MongoDB Integration** with Mongoose ODM
- **JWT Authentication** with secure token management
- **Code Execution Engine** supporting JavaScript, Python, Java, C++, TypeScript
- **Problem Management** with CRUD operations
- **User Progress Tracking** with achievements and streaks
- **Rate Limiting** and security middleware

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Context API for state management
- Vite for build tooling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- VM2 for secure code execution
- Express Validator for input validation
- Helmet for security headers
- CORS for cross-origin requests

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Python 3.x (for Python code execution)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd codemaster
```

### 2. Backend Setup
```bash
cd server
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/codemaster
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Frontend Setup
```bash
cd ..  # Back to root directory
npm install
```

### 4. Database Setup

#### Start MongoDB
```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Seed the Database
```bash
cd server
npm run seed
```

### 5. Start the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```

#### Start Frontend (Terminal 2)
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🗃️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  stats: {
    problemsSolved: Number,
    currentStreak: Number,
    longestStreak: Number,
    totalSubmissions: Number,
    acceptedSubmissions: Number,
    points: Number
  },
  solvedProblems: [{ problemId, difficulty, language, runtime, memory }],
  achievements: [{ achievementId, earnedAt }],
  selectedTopics: [String],
  settings: { theme, fontSize, codeTheme, etc. },
  streakData: [{ date, problemsSolved }]
}
```

### Problem Model
```javascript
{
  title: String,
  slug: String (unique),
  difficulty: Enum['Easy', 'Medium', 'Hard'],
  description: String,
  examples: [{ input, output, explanation }],
  constraints: [String],
  tags: [String],
  testCases: [{ input, expectedOutput, isHidden }],
  codeTemplates: { javascript, python, java, cpp, typescript },
  stats: { totalSubmissions, acceptedSubmissions, acceptanceRate }
}
```

### Submission Model
```javascript
{
  userId: ObjectId,
  problemId: ObjectId,
  code: String,
  language: String,
  status: Enum['Accepted', 'Wrong Answer', 'Runtime Error', etc.],
  runtime: Number,
  memory: Number,
  testCaseResults: [{ status, input, expectedOutput, actualOutput }]
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Problems
- `GET /api/problems` - Get all problems (with filters)
- `GET /api/problems/:slug` - Get single problem
- `GET /api/problems/search?q=term` - Search problems
- `GET /api/problems/random` - Get random problem
- `POST /api/problems` - Create problem (Admin)

### Submissions
- `POST /api/submissions` - Submit code
- `POST /api/submissions/run` - Run code (test)
- `GET /api/submissions` - Get user submissions
- `GET /api/submissions/:id` - Get single submission

### Code Execution
- `POST /api/execute/run` - Execute code with custom input

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/settings` - Update settings
- `GET /api/users/streak` - Get streak data

## 🏃‍♂️ Code Execution System

The platform includes a secure code execution engine that supports:

### Supported Languages
- **JavaScript** - Using VM2 for sandboxed execution
- **Python** - Using subprocess with timeout controls
- **TypeScript** - Transpiled to JavaScript
- **Java** - Compiled and executed (requires JDK)
- **C++** - Compiled with g++ (requires compiler)

### Security Features
- **Sandboxed Execution** - Isolated environment for code execution
- **Timeout Protection** - 5-second execution limit
- **Memory Limits** - 128MB memory restriction
- **Input Sanitization** - Proper input parsing and validation
- **Error Handling** - Comprehensive error catching and reporting

### Test Case Execution
```javascript
// Example test case format
{
  input: "nums = [2,7,11,15], target = 9",
  expectedOutput: "[0,1]",
  isHidden: false
}
```

## 📊 Getting DSA Problems from Free Sources

### 1. LeetCode Problems (Web Scraping)
```bash
cd server
npm run fetch-leetcode
```

This script fetches free problems from LeetCode using their GraphQL API.

### 2. Multiple API Sources
```bash
cd server
npm run fetch-apis
```

This script fetches problems from various free sources:

#### Available Sources:
- **Codeforces API** - Public competitive programming problems
- **GitHub Repositories** - Curated problem collections
- **AtCoder** - Japanese competitive programming platform
- **SPOJ** - Sphere Online Judge (via web scraping)

#### Manual Problem Sources:
1. **LeetCode** - Use the provided scraper for free problems
2. **HackerRank** - Limited free API access
3. **GeeksforGeeks** - Web scraping for educational problems
4. **InterviewBit** - Programming interview questions
5. **GitHub Collections**:
   - `jwasham/coding-interview-university`
   - `kdn251/interviews`
   - `donnemartin/interactive-coding-challenges`
   - `TheAlgorithms/Python`
   - `TheAlgorithms/JavaScript`

### 3. Custom Problem Creation
You can also create custom problems using the admin interface or directly via the API:

```javascript
POST /api/problems
{
  "title": "Custom Problem",
  "difficulty": "Easy",
  "description": "Problem description...",
  "examples": [...],
  "testCases": [...],
  "codeTemplates": {...}
}
```

## 🔐 Security Features

- **Input Validation** - Express-validator for request validation
- **Rate Limiting** - Protection against brute force attacks
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing configuration
- **JWT** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **Code Execution Security** - Sandboxed execution environment

## 🚀 Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codemaster
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t codemaster-backend ./server
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

## 📈 Performance Optimizations

- **Database Indexing** - Optimized queries with proper indexes
- **Pagination** - Efficient data loading for large datasets
- **Caching** - Strategic caching for frequently accessed data
- **Connection Pooling** - MongoDB connection optimization
- **Code Splitting** - Frontend bundle optimization
- **Lazy Loading** - Component-based code splitting

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@codemaster.dev or join our Discord community.

## 🙏 Acknowledgments

- LeetCode for inspiration
- The open-source community for various tools and libraries
- Contributors and testers who helped improve the platform