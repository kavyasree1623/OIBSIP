const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");
const mailer = require("../config/mailer");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const sendActionEmail = (user, subject, link, action) => mailer.sendMail({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to: user.email,
  subject,
  text: `Hello ${user.name},\n\n${action}: ${link}\n\nIf you did not request this, you can ignore this email.`,
});

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password and phone",
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      address,
      emailVerified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
    try {
      await sendActionEmail(user, "Verify your PizzaGo email", verifyUrl, "Verify your email");
    } catch (mailError) {
      console.error("Verification email could not be sent:", mailError.message);
      return res.status(503).json({
        success: false,
        message: "Your account was created, but verification email could not be sent. Configure email delivery and ask an administrator to resend it.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created. Check your email for the verification link.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before signing in.",
      });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationTokenHash: hashToken(req.params.token),
      emailVerificationExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ success: false, message: "This verification link is invalid or expired." });
    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Email verified. You can now sign in." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Email verification failed." });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email, emailVerified: false });
    if (!user) return res.status(200).json({ success: true, message: "If verification is still required, a new link will be sent." });
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${token}`;
    await sendActionEmail(user, "Verify your PizzaGo email", url, "Verify your email");
    return res.status(200).json({ success: true, message: "A new verification link has been sent." });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Unable to send a verification email. Check the email configuration." });
  }
};

const requestPasswordReset = async (req, res) => {
  const response = { success: true, message: "If that account exists, a password reset link will be sent." };
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = await User.findOne({ email, emailVerified: true });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetTokenHash = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
      try {
        await sendActionEmail(user, "Reset your PizzaGo password", url, "Reset your password");
      } catch (mailError) {
        console.error("Password reset email could not be sent:", mailError.message);
      }
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(200).json(response);
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(req.params.token),
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ success: false, message: "This password reset link is invalid or expired." });
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Password reset failed." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
};
