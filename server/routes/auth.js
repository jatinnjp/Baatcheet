const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/register - Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login - Login a user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
