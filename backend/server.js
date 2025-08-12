require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const adRoutes = require('./routes/adsRoutes');
const profileRoutes = require('./routes/profileRoute');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app); // ✅ Socket.io ke liye HTTP server use

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ API Routes
app.use('/ads', adRoutes);
app.use('/messages', messageRoutes);
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);

// ✅ Socket.io events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`📥 User joined room: ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, text } = data;

      const message = new Message({ senderId, receiverId, text });
      await message.save();

      io.to(receiverId).emit('receiveMessage', message);
      io.to(senderId).emit('receiveMessage', message);
    } catch (err) {
      console.error('❌ Message save error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ✅ PORT setup for Render
const PORT = process.env.PORT || 5000;

// ✅ Start server (Important: server.listen for Socket.io)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
