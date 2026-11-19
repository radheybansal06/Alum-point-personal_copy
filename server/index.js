require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const rateLimit = require('express-rate-limit');
const detectImport = require('detect-port');
const detect = typeof detectImport === 'function' ? detectImport : detectImport.default;

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const alumniRoutes = require('./routes/alumni');
const mentorshipRoutes = require('./routes/mentorship');
const opportunitiesRoutes = require('./routes/opportunities');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const llmRoutes = require('./routes/llm');
const announcementRoutes = require('./routes/announcements');

// Import middleware
const { auth } = require('./middleware/auth');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      // Allow localhost on any port in development
      if (process.env.NODE_ENV === 'development') {
        if (origin.match(/^http:\/\/localhost:\d+$/)) {
          return callback(null, true);
        }
      }
      
      // Allow specific origins
      const allowedOrigins = process.env.CLIENT_URL ? 
        (Array.isArray(process.env.CLIENT_URL) ? process.env.CLIENT_URL : [process.env.CLIENT_URL]) :
        ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"]
  }
});

// Store io instance in app for use in routes
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port in development
    if (process.env.NODE_ENV === 'development') {
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
    }
    
    // Allow specific origins from environment or default
    const allowedOrigins = process.env.CLIENT_URL ? 
      (Array.isArray(process.env.CLIENT_URL) ? process.env.CLIENT_URL : [process.env.CLIENT_URL]) :
      ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
connectDB();

// Socket.IO connection handling with JWT authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    socket.userId = decoded.id;
    socket.userType = decoded.type;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} (${socket.userType}: ${socket.userId})`);

  socket.on('join_channel', (channel) => {
    socket.join(channel);
    console.log(`User ${socket.id} joined channel: ${channel}`);
  });

  socket.on('leave_channel', (channel) => {
    socket.leave(channel);
    console.log(`User ${socket.id} left channel: ${channel}`);
  });

  socket.on('join_mentorship', (mentorshipId) => {
    socket.join(`mentorship_${mentorshipId}`);
    console.log(`User ${socket.id} joined mentorship: ${mentorshipId}`);
  });

  socket.on('leave_mentorship', (mentorshipId) => {
    socket.leave(`mentorship_${mentorshipId}`);
    console.log(`User ${socket.id} left mentorship: ${mentorshipId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id} (${socket.userType}: ${socket.userId})`);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Detect free port & start server
const DEFAULT_PORT = process.env.PORT || 3000;

detect(DEFAULT_PORT).then((port) => {
  if (port !== Number(DEFAULT_PORT)) {
    console.log(`⚠️ Port ${DEFAULT_PORT} is busy, switching to ${port}`);
  }

  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Verify email transport at boot
    if ((process.env.EMAIL_DRIVER || 'smtp') !== 'console') {
      try {
        const transport = (process.env.EMAIL_SERVICE === 'gmail')
          ? nodemailer.createTransport({
              service: 'gmail',
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            })
          : nodemailer.createTransport({
              host: process.env.EMAIL_HOST || 'smtp.gmail.com',
              port: process.env.EMAIL_PORT || 587,
              secure: false,
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

        transport.verify((err, success) => {
          if (err) {
            console.error('[Email] Transport verification failed:', err.message);
          } else {
            console.log('[Email] Transport verified and ready');
          }
        });
      } catch (e) {
        console.error('[Email] Transport init error:', e.message);
      }
    } else {
      console.log('[Email] Driver=console (emails are logged, not sent)');
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
