const axios = require("axios");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const WhatsappWebhookRouter = (io) => {
  const router = require("express").Router();

  router.post("/", async (req, res) => {
    console.log("POST request to /webhook");
    // Check the Incoming webhook message
    // console.log(JSON.stringify(req.body, null, 2));
    // check type of incoming the incoming request
    // Message request
    // console.log(req.body);
    if (req.body.entry[0]?.changes[0]?.value?.messages) {
      // console.log("Message request");
      // console.log(req.body.entry[0]?.changes[0]?.value);
      const type = req.body.entry[0]?.changes[0]?.value?.messages[0]?.type;
      const contacts = req.body.entry[0]?.changes[0]?.value?.contacts[0];
      const messages = req.body.entry[0]?.changes[0]?.value?.messages[0];
      console.log(contacts);

      /////////////////////////////////////////////
      let message;
      if (type === "text") {
        
        // if (messages?.text) {
        message = {
          conversationId: contacts.wa_id,
          senderId: contacts.wa_id,
          senderName: contacts.profile.name,
          text: messages?.text?.body,
          type,
        };
      } else if (type === "image") {
        // } else if (messages?.image) {
        const id = messages?.image?.id;
        const image = await axios.get(
          `https://graph.facebook.com/v14.0/${id}?access_token=${process.env.WA_ACCESS_TOKEN}`
        );
        const imageurl = image?.data?.url;
        // console.log("Image url: \n", imageurl?.data?.url);
        const imgbinary = await axios.get(imageurl, {
          responseType: "arraybuffer",
          headers: { Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}` },
        });
        const img = Buffer.from(imgbinary.data, "binary").toString("base64");
        message = {
          conversationId: contacts.wa_id,
          senderId: contacts.wa_id,
          senderName: contacts.profile.name,
          img,
          type,
        };
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

      io.emit("waMessage", {
        ...message,
        platform: "whatsapp",
        createdAt: Date.now(),
      });

      try {
        Message.create(message);
        const result = await Conversation.findOne({ id: contacts.wa_id });
        // const result = await Conversation.exists({ id: contacts.wa_id });
        if (!result) {
          const conversation = {
            id: contacts.wa_id,
            name: contacts.profile.name,
            last_message_type: messages?.text ? "text" : "image",
            last_message: messages?.text ? messages?.text?.body : "Image",
            last_message_time: Date.now(),
            lastmessageby: "customer",
            unread: true,
          };
          await Conversation.create(conversation);
        } else {
          if (!result.name) {
            await Conversation.updateOne(
              { id: contacts.wa_id },
              {
                $set: {
                  name: contacts.profile.name,
                  last_message: messages?.text ? messages?.text?.body : "Image",
                  last_message_time: Date.now(),
                  last_message_type: messages?.text ? "text" : "image",
                  lastmessageby: "customer",
                  unread: true,
                },
              }
            );
          } else {
            await Conversation.updateOne(
              { id: contacts.wa_id },
              {
                $set: {
                  last_message: messages?.text ? messages?.text?.body : "Image",
                  last_message_time: Date.now(),
                  last_message_type: messages?.text ? "text" : "image",
                  lastmessageby: "customer",
                  unread: true,
                },
              }
            );
          }
        }
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
      // console.log(req.body);
      const status = req.body.entry[0]?.changes[0]?.value?.statuses[0];
      await Message.updateOne(
        { id: status.id },
        {
          $set: {
            status: status.status,
          },
        }
      );
      io.emit("msgStatus", status);
      res.sendStatus(200);
    }

    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    // if (req.body.object) {
    //   if (
    //     req.body.entry &&
    //     req.body.entry[0].changes &&
    //     req.body.entry[0].changes[0] &&
    //     req.body.entry[0].changes[0].value.messages &&
    //     req.body.entry[0].changes[0].value.messages[0]
    //   ) {
    //     let phone_number_id =
    //       req.body.entry[0].changes[0].value.metadata.phone_number_id;
    //     let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
    //     let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
    //     // console.log("Sending axios post");
    //     try {
    //       const result = await axios({
    //         method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    //         url:
    //           "https://graph.facebook.com/v12.0/" +
    //           phone_number_id +
    //           "/messages?access_token=" +
    //           process.env.WA_ACCESS_TOKEN,
    //         data: {
    //           messaging_product: "whatsapp",
    //           to: from,
    //           text: { body: "Ack: " + msg_body },
    //         },
    //         headers: { "Content-Type": "application/json" },
    //       });
    //     } catch (error) {
    //       console.log(error);
    //       // console.log("ERROR!!");
    //     }
    //   }

    //   res.sendStatus(200);
    // } else {
    //   // Return a '404 Not Found' if event is not from a WhatsApp API
    //   res.sendStatus(404);
    // }
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
