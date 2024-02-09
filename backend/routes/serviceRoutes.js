const express = require("express");
const multer = require("multer");
const { createBlob } = require("@vercel/blob");
const sharp = require("sharp");
const User = require("../models/User");
const Avatar = require("../models/Avatar");
const serviceAuth = require("../middleware/serviceAuth");
const imgResize = require("../middleware/imgResize");
const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 4500000,
  },
});

// Route for services to upload an avatar for a user
router.post(
  "/avatar/:userId",
  serviceAuth,
  upload.single("avatar"),
  imgResize,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: "User not found." });
      }

      const avatar = new Avatar({
        user: userId,
        imageUrl: req.file.cloudStorageUrl,
        service: req.service._id,
      });
      await avatar.save();

      res.status(201).send({ message: "Avatar uploaded successfully", avatar });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  }
);

router.get("/avatar/:userId", serviceAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const avatars = await Avatar.find({
      user: userId,
      service: req.service._id,
    });

    if (!avatars.length) {
      return res.status(404).send({ error: "No avatars found for this user." });
    }

    res.send(avatars);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  }
});

module.exports = router;
