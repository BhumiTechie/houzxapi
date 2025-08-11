require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const adRoutes = require('./routes/adsRoutes'); 

const app = express();
const server = http.createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


// Routes
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/userRoutes'); // ✅ You added this
app.use('/ads', adRoutes); // ✅ Correct

app.use('/messages', messageRoutes);
app.use('/user', userRoutes); // ✅ This is required

// Socket.IO events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`📥 User joined room: ${userId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { senderId, receiverId, text } = data;

    const message = new Message({ senderId, receiverId, text });
    await message.save();

    io.to(receiverId).emit('receiveMessage', message);
    io.to(senderId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
