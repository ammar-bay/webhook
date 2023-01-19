const router = require("express").Router();
const db = require("../models");
const Conversation = db.Conversation;
const Message = db.Message;
const User = db.User;
const axios = require("axios");

//get all messages of a conversation
router.get("/:conversation_id", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { conversation_id: req.params.conversation_id },
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
  const { user_id, conversation_id, content, sender_name, type, created_at } =
    req.body;
  if (req.body.platform === "messenger") {
    console.log("Messenger");
    const url = `https://graph.facebook.com/v15.0/me/messages?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`;
    const body = {
      recipient: {
        id: conversation_id,
      },
      message: {
        content,
      },
    };
    try {
      const result = await axios.post(url, body, {
        headers: {
          // Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const savedMessage = await Message.create({
        conversation_id,
        user_id,
        sender_name,
        content,
        type,
        mid: result.data.message_id,
        created_at,
      });

      await Conversation.update(
        {
          last_message: text,
          last_message_time: Date.now(),
          last_message_type: type,
          last_message_by: sender_name,
          unread: false,
        },
        {
          where: { id: conversation_id },
        }
      );
      res.status(200).json(savedMessage);
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
      to: conversation_id,
      type: "text",
      text: {
        preview_url: false,
        body: content,
      },
    });

    try {
      const result = await axios.post(url, body, {
        headers: { Authorization: token, "Content-Type": "application/json" },
      });
      console.log(result);
      const savedMessage = await Message.create({
        conversation_id,
        user_id,
        type,
        content,
        mid: result.data.messages[0].id,
        created_at,
      });

      await Conversation.update(
        {
          last_message: content,
          last_message_time: created_at,
          last_message_type: type,
          lastmessageby: sender_name,
          unread: false,
        },
        {
          where: { id: conversation_id },
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
});

// This needs imporvement in cleaning the data and sending the response to client
// Operator sends a template to users from csv file
router.post("/numbers", async (req, res) => {
  const { array, template, user_id, sender_name } = req.body;
  const url = `https://graph.facebook.com/v14.0/107287895522530/messages`;
  const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;
  const cleanedData = array.filter((item) => item.Number && item.Name);
  const result = await Promise.all(
    cleanedData.map(async (item) => {
      const receiver_id = item.Number.replace("\r", "");
      const body = {
        messaging_product: "whatsapp",
        to: receiver_id,
        type: "template",
        template: { name: template, language: { code: "en_US" } },
      };
      try {
        //send the (template) message to customer
        const result = await axios.post(url, JSON.stringify(body), {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });

        //save the conversation in db
        // console.log("result.data.messages[0].id", result.data.messages[0].id);
        // const convo = await Conversation.exists({ id: receiver_id });
        // if (!convo) {
        //   await Conversation.create({
        //     id: receiver_id,
        //     last_message: template,
        //     last_message_time: Date.now(),
        //     last_message_type: "template",
        //     members: [user_id],
        //   });
        // }
        // console.log("Conversation created", receiver_id);
        // const messages = await Message.create({
        //   conversationId: receiver_id,
        //   user_id,
        //   sender_name,
        //   text: template,
        //   id: result.data.messages[0].id,
        // });

        // res.sendStatus(200);
        console.log("Message sent successfully to: ", receiver_id);
        return receiver_id;
      } catch (error) {
        // console.log(error);
        console.log("Message unsuccessful to: ", receiver_id);
        // res.status(500).json({ error: "Something went wrong" });
        return receiver_id;
      }
    })
  );

  // result.forEach((item) => {
  //   console.log(item);
  // });
  res.status(200).json(result);
});

module.exports = router;
