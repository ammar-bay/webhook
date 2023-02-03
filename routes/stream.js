const db = require("../models");
const Conversation = db.Conversation;
const Message = db.Message;

const WhatsappWebhookRouter = (io) => {
  const router = require("express").Router();
  router.post("/conversation", async (req, res) => {
    const { id } = req.body;
    const name = "STREAM" + new Date().toISOString();
    try {
      const conversation = await Conversation.create({
        id,
        name,
      });
    } catch (error) {
      console.log("Error creating conversation");
      console.log(error);
      res.status(500).json(error);
      return;
    }
    res.status(200).json({
      message: `Conversation with ${id} has been created successfully`,
    });
  });

  router.post("/message", async (req, res) => {
    const { mid, type, content, sender_name, conversation_id } = req.body;
    const message = {
      mid,
      type: "text",
      content: message,
      sender_name,
      conversation_id,
      created_at: Date.now(),
    };
    try {
      const msg = await Message.create(message);
      io.emit("waMessage", {
        ...message,
        platform: "stream",
      });
    } catch (error) {
      console.log("Error creating message");
      console.log(error);
      res.status(500).json(error);
      return;
    }

    res.status(200).json({
      message: `Message has been created successfully`,
    });
  });
};
