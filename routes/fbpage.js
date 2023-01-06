const axios = require("axios");
const router = require("express").Router();

const url = "https://graph.facebook.com";
const token = process.env.FB_PAGE_ACCESS_TOKEN;

router.get("/image/:postid", verifyRoles(["Admin"]), async (req, res) => {
  const { postid } = req.params.postid;
  try {
    const result = await axios.get(
      `${url}/${postid}/attachments?access_token=${token}`
    );
    res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/comments/:postid", verifyRoles(["Admin"]), async (req, res) => {
  const { postid } = req.params.postid;
  try {
    const result = await axios.get(
      `${url}/${postid}/comments?access_token=${token}`
    );
    res.status(200).json(result.data);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.post(
  "/replycomment/:commentid",
  verifyRoles(["Admin"]),
  async (req, res) => {
    const { commentid } = req.params.commentid;
    const { msg } = req.body;
    try {
      const result = await axios.post(
        `${url}/${commentid}/comments?access_token=${token}`,
        {
          message: msg,
        }
      );
      res.status(200).json(result.data);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
);
export default router;
