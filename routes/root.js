const router = require("express").Router();

router.get("/", async (req, res) => {
  console.log("root route");
  
  res.send("Hello World! This worked!!");
});

module.exports = router;
