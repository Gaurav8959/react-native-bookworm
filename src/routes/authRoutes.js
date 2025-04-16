import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if ((!email, !username, !password)) {
      return res.status(400).json({ message: "All fileld are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password sould be at least 6 characters long" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "User should be at least 3 character long" });
    }

    const ExistsEmail = await User.findOne({ email });
    if (ExistsEmail)
      return res.status(400).json({ message: "Email already exists" });

    const ExistsUser = await User.findOne({ email });
    if (ExistsUser)
      return res.status(400).json({ message: "User already exists" });

    const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`;
    const user = new User({
      email,
      username,
      password,
      profileImage: profileImage,
    });

    await user.save();
    const token = generateToken(user._id);
    res
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImmage: user.profileImage,
        },
      });
      console.log(user.username, user.email)
  } catch (error) {
    console.log("Error in register route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const ifPasswordCorrect = await user.comparePassword(password);
    if (!ifPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res
      .status(200)
      .json({
        token,
        user: {
          id: user._id,
          email: user.email,
          profileImmage: user.profileImage,
        },
      });
  } catch (error) {
    console.log("Error inn login rouute", error);
    res.status(500).json({ message: "Internal server error"});
  }
});

export default router;
