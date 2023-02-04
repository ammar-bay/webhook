const axios = require("axios");
// const Message = require("../models/Message");
// const Conversation = require("../models/Conversation");
const db = require("../models");
const Message = db.Message;
const Conversation = db.Conversation;

const WhatsappWebhookRouter = (io) => {
  const router = require("express").Router();

  router.post("/", async (req, res) => {
    console.log("POST request to /webhook");
    // console.log(req.body);
    if (req.body.entry[0]?.changes[0]?.value?.messages) {
      // console.log(req.body.entry[0]?.changes[0]?.value);
      const type = req.body.entry[0]?.changes[0]?.value?.messages[0]?.type;
      const contacts = req.body.entry[0]?.changes[0]?.value?.contacts[0];
      const messages = req.body.entry[0]?.changes[0]?.value?.messages[0];

      /////////////////////////////////////////////

      let content;
      if (type === "text") {
        content = messages?.text?.body;
      } else if (type === "image") {
        const id = messages?.image?.id;
        const image = await axios.get(
          `https://graph.facebook.com/v14.0/${id}?access_token=${process.env.WA_ACCESS_TOKEN}`
        );
        const imageurl = image?.data?.url;
        const imgbinary = await axios.get(imageurl, {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}` },
        });
        const img = Buffer.from(imgbinary.data, "binary").toString("base64");
        content = img;
      } else if (type === "audio") {
        res.sendStatus(200);
        return;
      } else if (type === "reaction") {
        res.sendStatus(200);
        return;
      } else {
        console.log("Unknown message type", type);
        res.sendStatus(200);
        return;
      }

      const message = {
        conversation_id: contacts.wa_id,
        user_id: null,
        sender_name: contacts.profile.name,
        mid: messages.id,
        type,
        content,
        created_at: Date.now(),
      };

      io.emit("waMessage", {
        ...message,
        // sending this if the message is a new conversation
        platform: "whatsapp",
      });
      try {
        const result = await Conversation.findOne({
          where: { id: contacts.wa_id },
        });

        if (!result) {
          const conversation = {
            id: contacts.wa_id,
            name: contacts.profile.name,
            last_message_type: type,
            last_message: type === "text" ? content : "Image",
            last_message_time: Date.now(),
            last_message_by: "customer",
            platform: "whatsapp",
            unread: true,
          };
          await Conversation.create(conversation);
        } else {
          await Conversation.update(
            {
              name: contacts.profile.name,
              last_message: type === "text" ? message.content : "Image",
              last_message_time: Date.now(),
              last_message_type: type,
              last_message_by: "customer",
              unread: true,
            },
            { where: { id: contacts.wa_id } }
          );
        }
        Message.create(message);
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        console.log("Error in WA Message request");
        res.sendStatus(500);
      }
    }
    // Message status request
    else {
      console.log("Message status request");
      const status = req.body.entry[0]?.changes[0]?.value?.statuses[0];
      await Message.update(
        {
          status: status.status,
        },
        { where: { mid: status.id } }
      );
      io.emit("msgStatus", status);
      res.sendStatus(200);
    }
  });

  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
  router.get("/", (req, res) => {
    console.log("GET request received at /webhook endpoint");
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN;
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
  return router;
};
module.exports = WhatsappWebhookRouter;
