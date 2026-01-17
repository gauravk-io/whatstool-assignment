const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted"],
    default: "Pending",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// prevent multiple pending invites for same email + org
invitationSchema.index({ email: 1, orgId: 1, status: 1 }, { unique: true });

module.exports = mongoose.model("Invitation", invitationSchema);
