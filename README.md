# AlumPoint - Alumni Engagement Platform

A comprehensive alumni engagement platform that connects students with alumni for mentorship, opportunities, and community building.

## Features

### 🎯 Core Functionality
- **Multi-role Authentication**: Admin, Alumni, and Student roles with different access levels
- **Real-time Chat**: Socket.IO-powered community chat with topic-based channels
- **AI-Powered Mentorship**: LLM-integrated mentor search and matching system
- **Opportunities Platform**: Job posting and application management
- **Event Management**: Create and manage alumni events
- **Announcements System**: Platform-wide communication system

### 👥 User Roles

#### Admin
- Upload alumni CSV files and send invitation emails
- Manage events and announcements
- Moderate community chat
- Access platform analytics

#### Alumni
- Login with provided credentials
- Upload resume for profile auto-completion
- Mentor students and share opportunities
- Participate in community discussions

#### Students
- Sign up with university email and OTP verification
- Complete profile with skills and interests
- Find mentors using natural language search
- Apply to opportunities posted by alumni

## Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Nodemailer** - Email sending
- **Bcrypt** - Password hashing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alumpoint
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/alumpoint
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

# Email configuration (for OTP and invites)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File upload settings
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Database Setup

Make sure MongoDB is running on your system:

```bash
# Start MongoDB (if not already running)
mongod
```

The application will automatically create the necessary collections when you first run it.

### 5. Create Admin Account

You'll need to create an admin account manually in the database. You can use MongoDB Compass or the MongoDB shell:

```javascript
// Connect to MongoDB
use alumpoint

// Create admin account
db.admins.insertOne({
  employee_id: "ADMIN001",
  first_name: "Admin",
  last_name: "User",
  email: "admin@university.edu",
  password: "$2a$10$hashedpassword", // Use bcrypt to hash your password
  role: "admin"
})
```

To hash a password, you can use an online bcrypt generator or create a simple script.

## Running the Application

### Development Mode
```bash
# Start both frontend and backend concurrently
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend server
npm run server
```

## Usage Guide

### 1. Admin Setup
1. Login with your admin credentials
2. Upload a CSV file with alumni data
3. The system will generate usernames/passwords and send invitation emails
4. Create events and announcements as needed

### 2. Alumni Onboarding
1. Check email for invitation with login credentials
2. Login to the platform
3. Upload resume for profile auto-completion
4. Review and edit profile information
5. Start mentoring students and posting opportunities

### 3. Student Registration
1. Sign up with university email
2. Verify email with OTP
3. Complete profile with skills and interests
4. Start searching for mentors and opportunities

### 4. CSV Format for Alumni Upload

The CSV file should contain the following columns:

**Required:**
- `email` - Alumni email address
- `first_name` - First name
- `last_name` - Last name
- `roll_no` - Roll/registration number
- `grad_year` - Graduation year
- `department` - Department name

**Optional:**
- `company` - Current company
- `role` - Current job role
- `skills` - Comma-separated skills
- `bio` - Short biography
- `linkedin` - LinkedIn profile URL
- `github` - GitHub profile URL

Example CSV:
```csv
email,first_name,last_name,roll_no,grad_year,department,company,role,skills
john.doe@email.com,John,Doe,CS2018001,2020,Computer Science,Google,Software Engineer,"JavaScript,Python,React"
jane.smith@email.com,Jane,Smith,IT2018002,2019,Information Technology,Microsoft,Product Manager,"Product Management,Agile,Leadership"
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/alumni/login` - Alumni login
- `POST /api/auth/student/signup` - Student registration
- `POST /api/auth/student/verify-otp` - OTP verification
- `POST /api/auth/student/login` - Student login
- `GET /api/auth/me` - Get current user

### Mentorship
- `POST /api/mentorship/search` - Search mentors using LLM
- `POST /api/mentorship/request` - Request mentorship
- `GET /api/mentorship/requests` - Get mentorship requests (alumni)
- `POST /api/mentorship/respond` - Respond to mentorship request
- `GET /api/mentorship/conversations` - Get active conversations

### Opportunities
- `GET /api/opportunities` - Browse opportunities
- `POST /api/opportunities` - Create opportunity (alumni)
- `POST /api/opportunities/:id/apply` - Apply to opportunity
- `GET /api/opportunities/my/opportunities` - Get my opportunities (alumni)
- `GET /api/opportunities/my/applications` - Get my applications (student)

### Chat
- `GET /api/chat/:channel` - Get channel messages
- `POST /api/chat/:channel` - Send message
- `PUT /api/chat/message/:id` - Edit message
- `DELETE /api/chat/message/:id` - Delete message

### Admin
- `POST /api/admin/upload-alumni` - Upload alumni CSV
- `GET /api/admin/dashboard` - Get dashboard stats
- `POST /api/admin/events` - Create event
- `POST /api/admin/announcements` - Create announcement

### LLM Integration
- `POST /api/llm/extract` - Extract keywords from natural language (stub implementation)

## File Structure

```
alumpoint/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── uploads/           # File uploads directory
│   ├── package.json
│   └── index.js
├── package.json           # Root package.json
└── README.md
```

## Development

### Adding New Features

1. **Backend**: Add new routes in `server/routes/`
2. **Frontend**: Add new components in `client/src/components/`
3. **Database**: Create new models in `server/models/`
4. **Real-time**: Use Socket.IO for real-time features

### Code Style

- Use ES6+ features
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for better UX

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Email Not Sending**
   - Verify email credentials in `.env`
   - Check if 2FA is enabled (use app password)

3. **File Upload Issues**
   - Ensure `uploads` directory exists
   - Check file size limits

4. **Socket.IO Connection Issues**
   - Verify CORS settings
   - Check if ports are available

### Logs

- Backend logs are displayed in the terminal
- Frontend errors are shown in browser console
- Use browser dev tools for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**AlumPoint** - Building stronger alumni communities through technology.