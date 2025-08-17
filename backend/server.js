require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const app = require('./app');   // ✅ Import your Express app

const server = http.createServer(app);

// ✅ Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

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

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
