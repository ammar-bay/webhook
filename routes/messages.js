const router = require("express").Router();
const Message = require("../models/Message");
const axios = require("axios");

// Operator replies to a message
router.post("/", async (req, res) => {
  const { senderId, conversationId, text } = req.body;
  const url = `https://graph.facebook.com/v14.0/105677815657877/messages`;
  const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;

  // send this message to the receiverId that is the number of the customer
  const body = `
    {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "${conversationId}",
      "type": "text",
      "text": {
        "preview_url": false,
        "body": "${text}"
      }
    }`;
  try {
    const result = await axios.post(url, body, {
      headers: { Authorization: token, "Content-Type": "application/json" },
    });
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }

  // event for other operators to get this reply
  // io.emit("oMessage", {
  //   senderId,
  //   receiverId,
  //   text,
  // });

  // save the conversation in db
});

//get
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
