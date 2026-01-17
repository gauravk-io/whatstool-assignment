const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      orgId: this.orgId.toString(),
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
