const express = require("express");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const webhookRoute = require("./routes/webhook");
const fbpagewebhookRoute = require("./routes/fbpagewebhook");
const messageRoute = require("./routes/messages");
const credentials = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");

const PORT = process.env.PORT || 8900;

dotenv.config();

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);

  //send and get message
  socket.on("sendMessage", ({ senderId, text }) => {
    console.log(senderId, text);
    // socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    // const user = getUser(receiverId);
    // io.to(user.socketId).emit("getMessage", {
    io.emit("waMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    // io.emit("getUsers", users);
  });
});

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

//middleware
app.set("view engine", "ejs");
app.set(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(cors());
// app.use(credentials)
// app.use(cors(corsOptions));

// Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/messages", messageRoute);
app.use("/conversations", conversationRoute(io));

// webhooks
app.use("/webhook", webhookRoute(io));
app.use("/fbpage", fbpagewebhookRoute(io));

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
