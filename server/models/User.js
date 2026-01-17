const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
    required: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ensure email is unique per organization
userSchema.index({ email: 1, orgId: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
