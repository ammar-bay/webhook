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
    const { receiver_id, template, user_id, sender_name } = req.body;

    const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
    const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;
    const body = `{ "messaging_product": "whatsapp", "to": ${receiver_id}, "type": "template", "template": { "name": "${template}", "language": { "code": "en_US" } } }`;

    // can use promise.all here
    try {
      //send the (template) message to customer
      const result = await axios.post(url, body, {
        headers: { Authorization: token, "Content-Type": "application/json" },
      });

      //save the conversation in db
      const convo = await Conversation.findOne({
        where: { id: receiver_id },
      });
      if (!convo) {
        await Conversation.create({
          id: receiver_id,
          last_message: template,
          last_message_time: Date.now(),
          last_message_type: "template",
          last_message_by: sender_name,
        });
        // create entry into the conversation_user table with conversaton_id: receiverId and user_id: senderId
        console.log("Conversation created", receiver_id);

      }
      const message = await Message.create({
        conversation_id: receiver_id,
        user_id,
        sender_name,
        type: "template",
        content: template,
        mid: result.data.messages[0].id,
        created_at: Date.now(),
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
