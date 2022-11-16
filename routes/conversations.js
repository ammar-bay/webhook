const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const axios = require("axios");

//new conv
const ConversationRouter = (io) => {
  const router = require("express").Router();

  //   router.post("/", async (req, res) => {
  //     const newConversation = new Conversation({
  //       members: [req.body.senderId, req.body.receiverId],
  //   });

  //   try {
  //     const savedConversation = await newConversation.save();
  //     res.status(200).json(savedConversation);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // });

  //Operator initiated chat with customer on WhatsApp message will be a template message
  router.post("/initiate", async (req, res) => {
    // console.log("Initiate chat");
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
      const convo = await Conversation.exists({ id: receiverId });
      if (!convo) {
        await Conversation.create({
          id: receiverId,
          members: [senderId],
        });
      }
      console.log("Conversation created", receiverId);
      const messages = await Message.create({
        conversationId: receiverId,
        senderId,
        senderName,
        text: template,
      });

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  });

  //get conv of a user
  router.get("/", async (req, res) => {
    try {
      const conversation = await Conversation.find();
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  // get conv includes two userId
  // router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  //   try {
  //     const conversation = await Conversation.findOne({
  //       members: { $all: [req.params.firstUserId, req.params.secondUserId] },
  //     });
  //     res.status(200).json(conversation);
  //   } catch (err) {
  //     res.status(500).json(err);
  //   }
  // });
  return router;
};
module.exports = ConversationRouter;
