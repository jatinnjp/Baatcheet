// Baatcheet/server/server.js
const messageRoutes = require("./routes/message");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load .env file

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON from requests

// Import auth routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);


const authRoutes = require("./routes/auth");

// Use routes
app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Baatcheet backend running on port 5000"));
  })
  .catch((err) => console.error(err));
