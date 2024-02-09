const express = require("express");
const multer = require("multer");
const { createBlob } = require("@vercel/blob");
const sharp = require("sharp");
const User = require("../models/User");
const Avatar = require("../models/Avatar");
const authServiceMiddleware = require("../middleware/authServiceMiddleware");
const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 4500000,
  },
});

const resizeAndUploadImageMiddleware = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(256, 256)
      .png()
      .toBuffer();

    const { url } = await createBlob({
      projectId: process.env.VERCEL_PROJECT_ID,
      token: process.env.VERCEL_TOKEN,
      name: `service-avatar-${Date.now()}.png`,
      contentType: "image/png",
      data: resizedImageBuffer,
    });

    req.file.cloudStorageUrl = url;
    next();
  } catch (error) {
    console.error("Failed to upload image:", error);
    res.status(500).send({ error: "Failed to process image." });
  }
};

// Route for services to upload an avatar for a user
router.post(
  "/avatar/:userId",
  authServiceMiddleware,
  upload.single("avatar"),
  resizeAndUploadImageMiddleware,
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

// Route for services to retrieve all avatars they have uploaded for a specific user
router.get("/avatar/:userId", authServiceMiddleware, async (req, res) => {
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
