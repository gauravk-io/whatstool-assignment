const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Organization = require("../models/Organization");

/**
 * POST /api/auth/register
 * Register a new organization with an admin user
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    // Validate input
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Create organization
    const organization = new Organization({
      name: organizationName,
    });
    await organization.save();

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "admin",
      orgId: organization._id,
    });
    await user.save();

    // Generate JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      message: "Organization and admin user created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: organization._id,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists." });
    }
    res.status(500).json({ error: "Registration failed." });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT
    const token = user.generateAuthToken();

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

module.exports = router;
