const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true },
  selectedAvatar: { type: mongoose.Schema.Types.ObjectId, ref: "Avatar" },
  avatars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Avatar" }],
});

module.exports = mongoose.model("User", userSchema);
