const axios = require("axios");
const Notification = require("../models/Notification");

const FacebookWebhookRouter = (io) => {
  const router = require("express").Router();

  // getting notification from facebook
  router.post("/", async (req, res) => {
    // Check the Incoming webhook message
    console.log("POST request at /fbpage endpoint");
    console.log(req.body);

    if (req.body.object === "page") {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.item
      ) {
        // const type = req.body.entry[0].changes[0].value.item;
        const value = req.body.entry[0].changes[0].value;
        // console.log(value);
        console.log("Notification from Facebook Page Webhook");
        io.emit("fbEvents", value);
        try {
          const notify = await Notification.create(value);
          // console.log(notify);
        } catch (error) {
          // console.log("Error in saving notification in db");
          console.log(error);
        }
      } else if (
        req.body.entry &&
        req.body.entry[0].messaging &&
        req.body.entry[0].messaging[0] &&
        req.body.entry[0].messaging[0]
      ) {
        console.log("Message from Facebook Page Webhook");
        const value = req.body.entry[0].messaging[0];
        console.log(value);
        // let message;
        // io.emit("fbEvents", message);
        const message = {
          conversationId: value?.sender?.id,
          senderId: value?.sender?.id,
          // senderName: ,
          // text: ,
          type: "text",
        };
      } else {
        console.log("Could Match from Facebook Page Webhook");
      }
      res.sendStatus(200);
    } else {
      // Return a '404 Not Found' if event is not from a Facebook API
      res.sendStatus(200);
      // res.sendStatus(404);
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
