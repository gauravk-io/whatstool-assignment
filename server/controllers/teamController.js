const User = require("../models/User");
const Invitation = require("../models/Invitation");


// Get all team members in the organization

exports.getTeamMembers = async (req, res) => {
  try {
    // Query users where orgId matches the authenticated user's org
    const teamMembers = await User.find(
      { orgId: req.user.orgId  },
      { name: 1, email: 1, role: 1, createdAt: 1 },
    ).sort({ createdAt: -1 });

    res.json({
      teamMembers,
      count: teamMembers.length,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "Failed to fetch team members." });
  }
};

// Remove a team member from the organization

exports.removeTeamMember = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    // Find the user first to ensure they exist and get their email
    const userToDelete = await User.findOne({
      _id: userId,
      orgId: req.user.orgId,
    });

    if (!userToDelete) {
      return res.status(404).json({
        error: "User not found or does not belong to your organization.",
      });
    }

    // Delete the user
    await User.deleteOne({ _id: userId });

    // Also remove any invitations associated with this user's email
    await Invitation.deleteMany({
      email: userToDelete.email,
      orgId: req.user.orgId,
    });

    res.json({
      message: "User removed successfully.",
      userId,
    });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json({ error: "Failed to remove user." });
  }
};
