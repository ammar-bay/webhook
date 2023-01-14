const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
router.put("/:userId", async (req, res) => {
  const user_id = req.params.userId;
});

//delete user
router.delete("/:userId", async (req, res) => {
  const user_id = req.params.userId;
});

//get a user
router.get("/:userId", async (req, res) => {
  const user_id = req.params.userId;
});

module.exports = router;
