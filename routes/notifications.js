const router = require("express").Router();
const Notification = require("../models/Notification");
// const User = require("../models/User");

//create a notification
router.post("/", async (req, res) => {
  const newNotification = new Notification(req.body);
  try {
    const savedNotification = await newNotification.save();
    res.status(200).json(savedNotification);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a notification
router.put("/:id/reply", async (req, res) => {
  try {
    const result = await axios.post(
      `https://graph.facebook.com/${req.params.id}/comments?access_token=${process.env.FB_ACCESS_TOKEN}`,
      {
        message,
      }
    );
    const notification = await Notification.findOneAndUpdate(
      { comment_id: req.params.id },
      {
        $push: {
          reply: {
            msg: req.body.msg,
            userid: req.body.userid,
            username: req.body.username,
            reply_time: req.body.reply_time,
          },
        },
      },
      {
        new: true,
      }
    );
    res.status(200).json("the notification has been updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification.userId === req.body.userId) {
      await notification.deleteOne();
      res.status(200).json("the notification has been deleted");
    } else {
      res.status(403).json("you can delete only your notification");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a notification

router.put("/:id/like", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification.likes.includes(req.body.userId)) {
      await notification.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The notification has been liked");
    } else {
      await notification.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The notification has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a notification

router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline notifications

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userNotifications = await Notification.find({
      userId: currentUser._id,
    });
    const friendNotifications = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Notification.find({ userId: friendId });
      })
    );
    res.status(200).json(userNotifications.concat(...friendNotifications));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all notifications

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const notifications = await Notification.find({ userId: user._id });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
