// Baatcheet/server/routes/message.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");

// Middleware to verify JWT and attach user info to the request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded; // decoded will now have 'username'
    next();
  });
};

// POST /api/messages/send - Send a message
router.post("/send", verifyToken, async (req, res) => {
  const { receiver, content } = req.body;
  const sender = req.user.username;

  console.log("📨 Received message POST request:", { sender, receiver, content });

  try {
    const message = new Message({ sender, receiver, content });
    await message.save();
    console.log("✅ Message saved successfully:", message);
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("❌ Error saving message:", err);
    res.status(500).json({ message: "Error saving message", error: err.message });
  }
});

// GET /api/messages/:username - Get all messages between logged-in user and specified username
router.get("/:username", verifyToken, async (req, res) => {
  const user1 = req.user.username;
  const user2 = req.params.username;

  console.log(`📥 Fetching chat between ${user1} and ${user2}`);

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ]
    }).sort("timestamp");

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
});

// NEW: GET /api/messages/received/:username - Get all messages RECEIVED by this user
router.get("/received/:username", verifyToken, async (req, res) => {
  const username = req.params.username;

  console.log(`📥 Fetching all messages RECEIVED by ${username}`);

  try {
    const messages = await Message.find({ receiver: username }).sort("-timestamp");
    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching received messages:", err);
    res.status(500).json({ message: "Error fetching received messages", error: err.message });
  }
});

module.exports = router;
