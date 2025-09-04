require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const Message = require('./models/Message');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

let onlineUsers = {}; // userId -> Set of socketIds

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    if (!onlineUsers[userId]) onlineUsers[userId] = new Set();
    onlineUsers[userId].add(socket.id);

    // update all with online list
    io.emit('onlineUsers', Object.keys(onlineUsers));
  });

  // 📨 Send Message
  socket.on('sendMessage', async (msg, ack) => {
    try {
      const message = new Message({
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        timestamp: new Date(),
        delivered: false,
      });
      await message.save();

      // ack back to sender → "✓ sent"
      if (ack) ack({ ...message.toObject(), delivered: false });

      // send to receiver → on receive we mark delivered
      if (onlineUsers[msg.receiverId]) {
        onlineUsers[msg.receiverId].forEach((sid) =>
          io.to(sid).emit('receiveMessage', { ...message.toObject(), delivered: true })
        );
      }

      // also update sender with delivered true (after receiver got it)
      if (onlineUsers[msg.senderId]) {
        onlineUsers[msg.senderId].forEach((sid) =>
          io.to(sid).emit('messageDelivered', { _id: message._id })
        );
      }
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    for (let id in onlineUsers) {
      onlineUsers[id].delete(socket.id);
      if (onlineUsers[id].size === 0) delete onlineUsers[id];
    }
    io.emit('onlineUsers', Object.keys(onlineUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
