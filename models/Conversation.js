const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    id: {
      // this is customers phonenumber
      type: String,
      required: true,
    },
    name: {
      // this is customers name
      type: String,
      // required: true,
    },
    lastmessagetype: {
      type: String,
      // required: true,
    },
    lastmessage: {
      type: String,
    },
    lastmessagetime: {
      type: Number,
    },
    members: {
      // this will be an array of operators id
      type: Array,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
