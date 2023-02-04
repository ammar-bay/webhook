const router = require("express").Router();
const db = require("../models");
const Conversation_User = db.Conversation_User;

router.get("/conversation_user/:conversation_id", async (req, res) => {
  try {
    const conversation_user = await Conversation_User.findAll();
    conversation_user = conversation_user.filter(
      (conversation_user) =>
        conversation_user.conversation_id === req.params.conversation_id
    );
    res.status(200).json(conversation_user);
    return;
  } catch (error) {
    console.log("Error occured in the get all messages route");
    console.log(error);
    res.status(500).json(error);
    return;
  }
});


router.get("/conversation_user/:user_id", async (req, res) => {
  try {
    const conversation_user = await Conversation_User.findAll();
    conversation_user = conversation_user.filter(
      (conversation_user) => conversation_user.user_id === req.params.user_id
    );
    res.status(200).json(conversation_user);
    return;
  } catch (error) {
    console.log("Error occured in the get all messages route");
    console.log(error);
    res.status(500).json(error);
    return;
  }
});

router.get("/messages/:date", (req, res) => {
  
});
