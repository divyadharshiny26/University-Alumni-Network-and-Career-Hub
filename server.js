const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

connectDB();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5000'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('register_user', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} registered socket ${socket.id}`);
  });

  socket.on('send_connection_request', (data) => {
    io.to(data.toUserId).emit('receive_connection_request', {
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('io', io); // Make io available in req.app

// Routes
const authRoutes = require('./routes/authRoutes');
const alumniRoutes = require('./routes/alumniRoutes');
const jobRoutes = require('./routes/jobRoutes');
const eventRoutes = require('./routes/eventRoutes');
const careerRoutes = require('./routes/careerRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/career', careerRoutes);

// Serve frontend in both development and production
app.use(express.static(path.join(__dirname, 'dist')));

// API routes first
app.get('/api', (req, res) => {
  res.json({ message: 'Alumni Network API Running Successfully 🚀' });
});

// Serve frontend for specific routes (client-side routing)
app.get(['/', '/login', '/register', '/dashboard', '/alumni', '/jobs', '/events', '/career'], (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});

