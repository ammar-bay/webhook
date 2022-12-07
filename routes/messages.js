const router = require("express").Router();
const Message = require("../models/Message");
const axios = require("axios");
const Conversation = require("../models/Conversation");
const { parse } = require("csv-parse");

// Operator replies to a message
router.post("/", async (req, res) => {
  const { senderId, conversationId, text, senderName } = req.body;
  const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
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
    // console.log(result.data.messages[0].id);
    const newMessage = new Message({
      ...req.body,
      id: result.data.messages[0].id,
    });
    const savedMessage = await newMessage.save();
    await Conversation.updateOne(
      { id: conversationId },
      {
        $set: {
          lastmessage: text,
          lastmessagetime: Date.now(),
          lastmessagetype: "text",
          lastmessageby: senderName,
          unread: false,
        },
        $addToSet: { members: senderId },
      }
    );

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

router.post("/numbers", async (req, res) => {
  const { array, template, senderId, senderName } = req.body;
  const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
  const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;
  console.log(req.body);
  const cleanedData = array.filter((item) => item.Number && item.Name);
  const result = await Promise.all(
    cleanedData.map(async (item) => {
      const receiverId = item.Number.replace("\r", "");
      const body = `{
        "messaging_product": "whatsapp",
        "to": ${receiverId},
        "type": "template",
        "template": { "name": "${template}", "language": { "code": "en_US" } }
      }`;
      // can use promise.all here
      try {
        //send the (template) message to customer
        const result = await axios.post(url, body, {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });

        //save the conversation in db
        // console.log("result.data.messages[0].id", result.data.messages[0].id);
        const convo = await Conversation.exists({ id: receiverId });
        if (!convo) {
          await Conversation.create({
            id: receiverId,
            lastmessage: template,
            lastmessagetime: Date.now(),
            lastmessagetype: "template",
            members: [senderId],
          });
        }
        console.log("Conversation created", receiverId);
        const messages = await Message.create({
          conversationId: receiverId,
          senderId,
          senderName,
          text: template,
          id: result.data.messages[0].id,
        });

        // res.sendStatus(200);
        console.log("Message sent successfully to: ", receiverId);
        return receiverId;
      } catch (error) {
        console.log(error);
        console.log("Message unsuccessful to: ", receiverId);
        // res.status(500).json({ error: "Something went wrong" });
        return receiverId;
      }
    })
  );

  result.forEach((item) => {
    console.log(item);
  });
  res.status(200).json(result);
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
