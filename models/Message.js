const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      // this is customers phonenumber
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "",
    },
    senderId: {
      // this is operators id
      type: String,
    },
    senderName: {
      // this is operators name
      type: String,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
