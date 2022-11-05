const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    from: {
      id: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    post: {
      id: {
        type: String,
      },
      permalink_url: {
        type: String,
      },
    },
    post_id: {
      type: String,
    },
    parent_id: {
      type: String,
    },
    item: {
      type: String,
    },
    verb: {
      type: String,
    },
    message: {
      type: String,
    },
    created_time: {
      type: String,
    },
    reaction_type: {
      type: String,
    },
    unread: {
      type: Boolean,
      default: true,
    },
    reply: [
      {
        // id: {
        //   type: String,
        // },
        msg: {
          type: String,
        },
        userid: {
          // this is operator's id
          type: String,
        },
        username: {
          // this is operator's name
          type: String,
        },
        time: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", NotificationSchema);
