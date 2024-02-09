const sharp = require("sharp");
const put = require("@vercel/blob");

const imgResize = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(256, 256)
      .png()
      .toBuffer();

    const { url } = await put(
      `avatar-${req.user._id}-${Date.now()}.png`,
      resizedImageBuffer,
      {
        access: "public",
      }
    );

    req.file.cloudStorageUrl = url;

    next();
  } catch (error) {
    console.error("Failed to upload image:", error);
    res.status(500).send({ error: "Failed to process image" });
  }
};

module.exports = imgResize;
