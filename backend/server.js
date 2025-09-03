require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const Message = require('./models/Message');

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

let onlineUsers = {}; // userId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
    onlineUsers[userId].add(socket.id);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, text }) => {
    const message = new Message({ senderId, receiverId, text });
    await message.save();

    // Emit to all devices of receiver
    if (onlineUsers[receiverId]) {
      onlineUsers[receiverId].forEach(sid => io.to(sid).emit('receiveMessage', message));
    }

    // Emit to all devices of sender
    if (onlineUsers[senderId]) {
      onlineUsers[senderId].forEach(sid => io.to(sid).emit('receiveMessage', message));
    }
  });

  socket.on('disconnect', () => {
    for (let id in onlineUsers) {
      onlineUsers[id].delete(socket.id);
      if (onlineUsers[id].size === 0) delete onlineUsers[id];
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
