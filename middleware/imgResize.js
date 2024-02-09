const sharp = require("sharp");

const imgResize = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(256, 256)
      .png()
      .toBuffer();

    const { url } = await createBlob({
      projectId: process.env.VERCEL_PROJECT_ID,
      token: process.env.VERCEL_TOKEN,
      name: `avatar-${req.user._id}-${Date.now()}.png`,
      contentType: "image/png",
      data: resizedImageBuffer,
    });

    // Save the URL to the uploaded image in the request for further processing
    req.file.cloudStorageUrl = url;

    next();
  } catch (error) {
    console.error("Failed to upload image to Vercel Blob:", error);
    res.status(500).send({ error: "Failed to process image" });
  }
};

module.exports = imgResize;
