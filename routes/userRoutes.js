const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const Avatar = require("../models/Avatar");
const userAuth = require("../middleware/userAuth");
const imgResize = require("../middleware/imgResize");
const upload = multer({ limits: { fileSize: 5000000 } });

const router = express.Router();

// Upload a new avatar
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  imgResize,
  async (req, res) => {
    try {
      const email = req.user._id;
      const user = await User.findById(email);
      const avatar = new Avatar({
        user: email,
        imageUrl: req.file.cloudStorageUrl,
      });
      await avatar.save();
      user.avatars.push(avatar);
      await user.save();
      res.status(201).send({ message: "Avatar uploaded successfully", avatar });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

// Get a list of available avatars
router.get("/avatars", authMiddleware, async (req, res) => {
  try {
    const email = req.user._id;
    const avatars = await Avatar.find({ user: req.user._id });
    res.send(avatars);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
