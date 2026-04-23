const express = require("express");
const Subscriber = require("../models/Subscriber.js");
const nodemailer = require("nodemailer");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    await Subscriber.create({ email });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Subscribed to Weekly Pulse",
      html: `<h3>Thanks for subscribing!</h3><p>You are now subscribed to Trade Pulse market updates.</p>`,
    });

    return res.status(201).json({ message: "Subscribed successfully and email sent" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;