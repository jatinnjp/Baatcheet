const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// GET /api/users/usernames - Return all usernames (for auto-suggestions)
router.get("/usernames", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "username -_id");
    const usernames = users.map((u) => u.username);
    res.json(usernames);
  } catch (err) {
    console.error("❌ Error fetching usernames:", err);
    res.status(500).json({ message: "Error fetching usernames" });
  }
});

module.exports = router;
