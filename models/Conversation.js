const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    lastmessage: {
      type: String,
    },
    lastmessagetime: {
      type: String,
    },
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
