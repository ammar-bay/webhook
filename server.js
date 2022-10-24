const express = require("express");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const webhookRoute = require("./routes/webhook");
const fbpagewebhookRoute = require("./routes/fbpagewebhook");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
// const router = express.Router();
// const path = require("path");
const PORT = process.env.PORT || 8900;

dotenv.config();

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
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

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute(io));
app.use("/api/messages", messageRoute);
app.use("/webhook", webhookRoute);
app.use("/fbpage", fbpagewebhookRoute);

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
