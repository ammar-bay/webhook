const router = require("express").Router();
// const User = require("../models");
// const bcrypt = require("bcrypt");
const db = require("../models");
const User = db.User;
const awsCognito = require("amazon-cognito-identity-js");
const verifyRoles = require("../middleware/verifyRoles");

//REGISTER
// router.post("/register", verifyRoles(["Admin"]), async (req, res) => {
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const poolData = {
    UserPoolId: process.env.AWS_USER_POOL_ID,
    ClientId: process.env.AWS_CLIENT_ID,
  };
  const userPool = new awsCognito.CognitoUserPool(poolData);
  userPool.signUp(
    email,
    password,
    [
      new awsCognito.CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),

      new awsCognito.CognitoUserAttribute({
        Name: "name",
        Value: username,
      }),
      new awsCognito.CognitoUserAttribute({
        Name: "custom:role",
        Value: role,
      }),
    ],
    null,
    async (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json("Sign up failed");
      } else {
        // console.log(data);
        await User.create({
          username,
          email,
          password,
          role,
          id: data.userSub,
        });
        res.status(200).json(data);
      }
    }
  );

  // try {
  //   //generate new password
  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(req.body.password, salt);
  //   const userExist = await User.findOne({ email: req.body.email });
  //   if (userExist) {
  //     return res.status(400).json("Email already exists");
  //   }
  //   //create new user
  //   const newUser = new User({
  //     username: req.body.username,
  //     email: req.body.email,
  //     password: hashedPassword,
  //   });
  //   //save user and respond
  //   const user = await newUser.save();
  //   res.status(200).json(user);
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json("Sign up failed");
  // }
});

//LOGIN
// router.post("/login", async (req, res) => {
//   console.log("login route");
//   console.log(req.body.email);
//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) {
//       res.status(404).json("User with this Email not Found");
//       return;
//     }

//     const validPassword = await bcrypt.compare(
//       req.body.password,
//       user.password
//     );
//     if (!validPassword) {
//       res.status(400).json("Wrong Password");
//       return;
//     }
//     res.status(200).json(user);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json("Login Failed");
//   }
// });

module.exports = router;
