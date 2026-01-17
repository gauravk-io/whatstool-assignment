const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const Organization = require("../models/Organization");

// Create a new invitation

exports.createInvitation = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user exists in this organization
    const existingUser = await User.findOne({
      email: normalizedEmail,
      orgId: req.user.orgId,
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists in your organization.",
      });
    }

    // Check if pending invitation already exists for this email and org
    const existingInvite = await Invitation.findOne({
      email: normalizedEmail,
      orgId: req.user.orgId,
      status: "Pending",
    });

    if (existingInvite) {
      return res.status(400).json({
        error: "An invitation has already been sent to this email.",
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create invitation
    const invitation = new Invitation({
      email: normalizedEmail,
      orgId: req.user.orgId,
      token,
      status: "Pending",
      expiresAt,
    });

    await invitation.save();

    // Generate invite link
    const inviteLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/accept-invite/${token}`;

    res.status(201).json({
      message: "Invitation created successfully.",
      inviteLink,
      email: normalizedEmail,
      expiresAt,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ error: "Failed to create invitation." });
  }
};

// Get invitation details by token
 
exports.getInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    // Find invitation by token
    const invitation = await Invitation.findOne({ token }).populate(
      "orgId",
      "name",
    );

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found." });
    }

    // Check is invitation expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: "This invitation has expired." });
    }

    // Check is invitation already accepted
    if (invitation.status === "Accepted") {
      return res
        .status(400)
        .json({ error: "This invitation has already been accepted." });
    }

    res.json({
      email: invitation.email,
      organizationName: invitation.orgId.name,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    res.status(500).json({ error: "Failed to fetch invitation details." });
  }
};

// Accept an invitation and create user account

exports.acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    // Validate input
    if (!token || !name || !password) {
      return res
        .status(400)
        .json({ error: "Token, name, and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Find invitation by token
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ error: "Invalid invitation token." });
    }

    // Check is invitation expired
    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({ error: "This invitation has expired." });
    }

    // Check is invitation already accepted
    if (invitation.status === "Accepted") {
      return res
        .status(400)
        .json({ error: "This invitation has already been accepted." });
    }

    // Check if user already exists with this email in the organization
    const existingUser = await User.findOne({
      email: invitation.email,
      orgId: invitation.orgId,
    });

    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email already exists in this organization.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email: invitation.email,
      passwordHash,
      role: "member",
      orgId: invitation.orgId,
    });

    await user.save();

    // Mark invitation as accepted
    invitation.status = "Accepted";
    await invitation.save();

    // Generate JWT
    const tokenResponse = user.generateAuthToken();

    res.status(201).json({
      message: "Account created successfully.",
      token: tokenResponse,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation." });
  }
};
