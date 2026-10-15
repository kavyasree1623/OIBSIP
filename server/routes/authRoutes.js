const express = require("express");

const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
