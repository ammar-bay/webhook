const router = require("express").Router();
const db = require("../models");
const Conversation = db.Conversation;
const Message = db.Message;
const User = db.User;
const axios = require("axios");

//get all messages of a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversation_id: req.params.conversationId },
      include: {
        model: User,
        attributes: ["username"],
        as: "user",
      },
    });
    // if (!messages) {
    //   return res.status(200).json([]);
    // }
    res.status(200).json(messages);
  } catch (err) {
    console.log("Error occured in the get all messages route");
    console.log(err);
    res.status(500).json(err);
  }
});

// Operator replies to a message
router.post("/", async (req, res) => {
  const { senderId, conversationId, text, senderName } = req.body;
  if (req.body.platform === "messenger") {
    console.log("Messenger");
    const url = `https://graph.facebook.com/v15.0/me/messages?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`;
    const body = {
      recipient: {
        id: conversationId,
      },
      message: {
        text,
      },
    };
    try {
      const result = await axios.post(url, body, {
        headers: {
          // Authorization: token,
          "Content-Type": "application/json",
        },
      });
      // console.log(result.data);

      // const newMessage = new Message({
      //   ...req.body,
      //   id: result.data.message_id,
      // });
      // const savedMessage = await newMessage.save();
      const savedMessage = await Message.create({
        conversation_id: conversationId,
        user_id: senderId,
        type: "text",
        content: text,
        mid: result.data.message_id,
      });

      //update conversation
      // await Conversation.updateOne(
      //   { id: conversationId },
      //   {
      //     $set: {
      //       last_message: text,
      //       last_message_time: Date.now(),
      //       last_message_type: "text",
      //       lastmessageby: senderName,
      //       unread: false,
      //     },
      //     $addToSet: { members: senderId },
      //   }
      // );

      await Conversation.update(
        {
          last_message: text,
          last_message_time: Date.now(),
          last_message_type: "text",
          lastmessageby: senderName,
          unread: false,
        },
        {
          where: { id: conversationId },
        }
      );
      res.status(200).json(savedMessage);

      // return res.status(200).json({ message: "Message sent" });
    } catch (error) {
      console.log("Error occured in the post message route");
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  } else if (req.body.platform === "whatsapp") {
    console.log("Whatsapp");
    const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
    const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;

    const body = JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: conversationId,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    });

    try {
      const result = await axios.post(url, body, {
        headers: { Authorization: token, "Content-Type": "application/json" },
      });
      // console.log(result.data.messages[0].id);
      // const newMessage = new Message({
      //   ...req.body,
      //   id: result.data.messages[0].id,
      // });
      // const savedMessage = await newMessage.save();
      const savedMessage = await Message.create({
        conversation_id: conversationId,
        user_id: senderId,
        type: "text",
        content: text,
        mid: result.data.messages[0].id,
      });

      // await Conversation.updateOne(
      //   { id: conversationId },
      //   {
      //     $set: {
      //       last_message: text,
      //       last_message_time: Date.now(),
      //       last_message_type: "text",
      //       lastmessageby: senderName,
      //       unread: false,
      //     },
      //     $addToSet: { members: senderId },
      //   }
      // );

      await Conversation.update(
        {
          last_message: text,
          last_message_time: Date.now(),
          last_message_type: "text",
          lastmessageby: senderName,
          unread: false,
        },
        {
          where: { id: conversationId },
        }
      );
      res.status(200).json(savedMessage);
    } catch (error) {
      console.log("Something went wrong in Whatsapp: ", error);
      res.status(500).json({
        error: "Something went wrong in Whatapp message",
        err: error,
      });
    }
  }
  // event for other operators to get this reply
  // io.emit("oMessage", {
  //   senderId,
  //   receiverId,
  //   text,
  // });

  // save the conversation in db
});

// This needs imporvement in cleaning the data and sending the response to client
// Operator sends a template to users from csv file
router.post("/numbers", async (req, res) => {
  const { array, template, senderId, senderName } = req.body;
  const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
  const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;
  console.log(req.body);
  const cleanedData = array.filter((item) => item.Number && item.Name);
  const result = await Promise.all(
    cleanedData.map(async (item) => {
      const receiverId = item.Number.replace("\r", "");
      const body = {
        messaging_product: "whatsapp",
        to: receiverId,
        type: "template",
        template: { name: template, language: { code: "en_US" } },
      };
      // can use promise.all here
      try {
        //send the (template) message to customer
        const result = await axios.post(url, JSON.stringify(body), {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });

        //save the conversation in db
        // console.log("result.data.messages[0].id", result.data.messages[0].id);
        // const convo = await Conversation.exists({ id: receiverId });
        // if (!convo) {
        //   await Conversation.create({
        //     id: receiverId,
        //     last_message: template,
        //     last_message_time: Date.now(),
        //     last_message_type: "template",
        //     members: [senderId],
        //   });
        // }
        // console.log("Conversation created", receiverId);
        // const messages = await Message.create({
        //   conversationId: receiverId,
        //   senderId,
        //   senderName,
        //   text: template,
        //   id: result.data.messages[0].id,
        // });

        // res.sendStatus(200);
        console.log("Message sent successfully to: ", receiverId);
        return receiverId;
      } catch (error) {
        // console.log(error);
        console.log("Message unsuccessful to: ", receiverId);
        // res.status(500).json({ error: "Something went wrong" });
        return receiverId;
      }
    })
  );

  // result.forEach((item) => {
  //   console.log(item);
  // });
  res.status(200).json(result);
});

module.exports = router;
