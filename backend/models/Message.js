const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String, required: true },
    delivered: { type: Boolean, default: false }, // ✅ delivery status
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Message", messageSchema);
