const Conversation = require("../models/Conversation");

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

  router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  return router;
};
module.exports = ConversationRouter;
