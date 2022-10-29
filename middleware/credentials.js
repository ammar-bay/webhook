const allowedOrigins = require("../config/allowedOrigins");

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin.toString())) {
    res.header("Access-Control-Allow-Credentials", true);
  } else {
    console.log(`Not an allowed origin ${origin}`);
  }
  next();
};

module.exports = credentials;
