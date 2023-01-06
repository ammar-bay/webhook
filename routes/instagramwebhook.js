const axios = require("axios");
// const Notification = require("../models/Notification");
// const Message = require("../models/Message");
// const Conversation = require("../models/Conversation");

const InstagramWebhookRouter = (io) => {
  const router = require("express").Router();

  // getting notification from facebook
  router.post("/", async (req, res) => {
    // Check the Incoming webhook message
    console.log("POST request at /insta endpoint");
    // console.log(req.body);
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
module.exports = InstagramWebhookRouter;
