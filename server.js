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
      io.emit("getMessage", {
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
// app.use(cors(corsOptions));
app.use(cors());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/messages", messageRoute);
app.use("/api/conversations", conversationRoute(io));

// webhooks
app.use("/webhook", webhookRoute(io));
app.use("/fbpage", fbpagewebhookRoute(io));

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
