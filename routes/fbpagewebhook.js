const axios = require("axios");
// const Notification = require("../models/Notification");
// const Message = require("../models/Message");
const db = require("../models");
const Message = db.Message;
const Conversation = db.Conversation;

const FacebookWebhookRouter = (io) => {
  const router = require("express").Router();

  // getting notification from facebook
  router.post("/", async (req, res) => {
    // Check the Incoming webhook message
    console.log("POST request at /fb endpoint");
    // console.log(req.body);

    if (req.body.object === "page") {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.item
      ) {
        // // const type = req.body.entry[0].changes[0].value.item;
        console.log("Facebook Page");
        // const value = req.body.entry[0].changes[0].value;
        // // console.log(value);
        // io.emit("fbEvents", value);
        // try {
        //   const notify = await Notification.create(value);
        //   // console.log(notify);
        //   res.sendStatus(200);
        // } catch (error) {
        //   // console.log("Error in saving notification in db");
        //   console.log(error);
        //   res.sendStatus(500);
        // }
        res.sendStatus(200);
        return;
      } else if (
        req.body.entry &&
        req.body.entry[0].messaging &&
        req.body.entry[0].messaging[0] &&
        req.body.entry[0].messaging[0].message?.text
      ) {
        console.log("Facebook Messenger");
        const value = req.body.entry[0].messaging[0];
        console.log(value);
        if (value.sender.id === "105647745661703") {
          console.log("SENDER WAS PAGE IT SELF");
          // await Message.updateOne(
          //   { id: value.message.mid },
          //   { $set: { status: "delivered" } }
          // );
          // const status = {
          //   id: value.message.mid,
          //   status: "delivered",
          // };
          // io.emit("msgStatus", status);
          // res.sendStatus(200);
          return;
        }
        const message = {
          conversationId: value?.sender?.id,
          senderId: value?.sender?.id,
          // senderName: "",
          id: value?.message?.mid,
          text: value?.message?.text,
          type: "text",
        };
        // console.log(message);

        io.emit("waMessage", {
          ...message,
          platform: "messenger",
          createdAt: Date.now(),
        });

        try {
          await Message.create({
            conversation_id: value?.sender?.id,
            user_id: value?.sender?.id,
            mid: value?.message?.mid,
            type: "text",
            content: value?.message?.text,
          });
          const result = await Conversation.findOne({
            where: { id: value?.sender?.id },
          });
          if (!result) {
            let username = "";
            try {
              const userdetails = await axios.get(
                `https://graph.facebook.com/v2.6/${value?.sender?.id}?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`
              );
              console.log(userdetails);
              username =
                userdetails?.data?.first_name +
                " " +
                userdetails?.data?.last_name;
            } catch (error) {
              console.log("Error in getting user details");
              // console.log(error);
            }
            const conversation = {
              id: value?.sender?.id,
              name: username,
              last_message_type: value?.message?.text ? "text" : "image",
              last_message: value?.message?.text
                ? value?.message?.text
                : "Image",
              last_message_time: Date.now(),
              // lastmessageby: "customer",
              unread: true,
              platform: "messenger",
            };
            await Conversation.create(conversation);
          } else {
            await Conversation.update(
              {
                // $set: {
                  last_message: value?.message?.text
                    ? value?.message?.text
                    : "Image",
                  last_message_time: Date.now(),
                  last_message_type: value?.message?.text ? "text" : "image",
                  // lastmessageby: "customer",
                  unread: true,
                // },
              },
              { where: { id: value?.sender?.id } }
            );
          }
          res.sendStatus(200);
        } catch (error) {
          console.log("Error in WA Message request");
          // console.log(error);
          res.sendStatus(500);
        }
      } else {
        console.log("Could Match from Facebook Page Webhook");
        console.log(JSON.stringify(req.body));
        res.sendStatus(200);
      }
    } else {
      // Return a '404 Not Found' if event is not from a Facebook API
      console.log("Not from Facebook Page Webhook");
      res.sendStatus(404);
    }
  });

  // Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  // info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
  router.get("/", (req, res) => {
    console.log("GET request at /fbpage endpoint");
    /**
     *UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN;
    // console.log(req.body);
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
module.exports = FacebookWebhookRouter;
