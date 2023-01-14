const db = require("../models");
const Conversation = db.Conversation;
const Message = db.Message;
const User = db.User;
const axios = require("axios");

//new conv
const ConversationRouter = (io) => {
  const router = require("express").Router();

  //get all conversations
  router.get("/", async (req, res) => {
    try {
      const conversation = await Conversation.findAll();
      res.status(200).json(conversation);
    } catch (err) {
      console.log("Error occured in the get all conversations route");
      console.log(err);
      res.status(500).json(err);
    }
  });

  //Business initiated chat with customer on WhatsApp message will be a template message
  router.post("/initiate", async (req, res) => {
    console.log("initiate chat/send template message route");
    const { receiverId, template, senderId, senderName } = req.body;

    const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
    const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;
    const body = `{ "messaging_product": "whatsapp", "to": ${receiverId}, "type": "template", "template": { "name": "${template}", "language": { "code": "en_US" } } }`;

    // can use promise.all here
    try {
      //send the (template) message to customer
      const result = await axios.post(url, body, {
        headers: { Authorization: token, "Content-Type": "application/json" },
      });

      //save the conversation in db
      const convo = await Conversation.findOne({
        where: { id: receiverId },
      });
      if (!convo) {
        await Conversation.create({
          id: receiverId,
          last_message: template,
          last_message_time: Date.now(),
          last_message_type: "template",
          // members: [senderId],
        });
        // create entry into the conversation_user table with conversaton_id: receiverId and user_id: senderId
        console.log("Conversation created", receiverId);
      }
      const messages = await Message.create({
        conversation_id: receiverId,
        user_id: senderId,
        // senderName,
        type: "template",
        content: template,
        mid: result.data.messages[0].id,
      });

      res.sendStatus(200);
    } catch (err) {
      console.log("Error occured in the initiate chat route");
      // console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  return router;
};
module.exports = ConversationRouter;
