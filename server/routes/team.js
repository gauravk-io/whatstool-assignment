const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const inviteController = require("../controllers/inviteController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// Team Routes

router.get("/team", authMiddleware, adminOnly, teamController.getTeamMembers);
router.delete(
  "/team/:userId",
  authMiddleware,
  adminOnly,
  teamController.removeTeamMember,
);

// Invitation Routes

router.post(
  "/invite",
  authMiddleware,
  adminOnly,
  inviteController.createInvitation,
);
router.get("/invite/:token", inviteController.getInvitation);
router.post("/accept-invite", inviteController.acceptInvitation);

module.exports = router;
