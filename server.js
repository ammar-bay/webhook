const express = require("express");
const app = express();
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const rootRoute = require("./routes/root");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const notificationRoute = require("./routes/notifications");
const conversationRoute = require("./routes/conversations");
const webhookRoute = require("./routes/webhook");
const instawebhookRoute = require("./routes/instagramwebhook");
const fbwebhookRoute = require("./routes/fbpagewebhook");
const messageRoute = require("./routes/messages");
const cognitoAuth = require("./middleware/cognitoAuth");
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
  const url = `https://graph.facebook.com/v14.0/105677815657877/messages`;
  const token = `Bearer ${process.env.WA_ACCESS_TOKEN}`;

  //Operator replies to a message
  socket.on("sendMessage", async (message) => {
    // event for other operators to get this reply except the sender
    socket.broadcast.emit("oMessage", message);
  });

  socket.on("ioMessage", (message) => {
    socket.broadcast.emit("ioMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
  });
});

// dev db

// const DB = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@unifiedchatcluster.9mbke.mongodb.net/?retryWrites=true&w=majority`;

const DB =
  process.env.NODE_ENV === "development"
    ? `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@unifiedchatcluster.9mbke.mongodb.net/?retryWrites=true&w=majority`
    : `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@unifiedchatprod.9mbke.mongodb.net/?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
      // await mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (err) {
    console.log("Could not connect to DB");
    console.error(err);
  }
};

connectDB();

//middleware
app.set("view engine", "ejs");
app.set(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
// app.use(cors());
app.use(credentials);
app.use(cors(corsOptions));

// webhooks
app.use("/webhook", webhookRoute(io));
app.use("/fbwebhook", fbwebhookRoute(io));
app.use("/instagram", instawebhookRoute(io));

// Verify JWT token
app.use(cognitoAuth.getVerifyMiddleware());
// Routes
app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/posts", postRoute);
app.use("/messages", messageRoute);
app.use("/notifications", notificationRoute);
app.use("/conversations", conversationRoute(io));

app.use("/", rootRoute);
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
