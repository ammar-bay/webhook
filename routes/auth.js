const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(400).json("Email already exists");
    }
    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Sign up failed");
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  console.log("login route");
  console.log(req.body.email);
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json("User with this Email not Found");
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      res.status(400).json("Wrong Password");
      return;
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Login Failed");
  }
});

module.exports = router;
