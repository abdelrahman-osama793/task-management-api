const UserModel = require("../models/user_model");
const TokenModel = require("../models/token_model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const email = req.body.email;
  try {
    if (!email)
      return res.status(400).send({ message: "Please enter a valid email" });

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(404)
        .send({ message: "user with given email doesn't exist" });

    let token = await TokenModel.findOne({ userId: user._id });
    if (!token) {
      token = await new TokenModel({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL}/reset-password/${user._id}/${token.token}`;
    await sendEmail(user.email, "Password reset", link);
    console.log(link);
    res
      .status(200)
      .send({ message: "password reset link sent to your email account" });
  } catch (error) {
    res.status(500).send("An error occurred");
    console.log(error);
  }
});

router.post("/:userId/:token", async (req, res) => {
  try {
    if (!req.body.password) {
      res.status(400).send({ message: "Please enter a valid a password" });
    }

    const user = await UserModel.findById(req.params.userId);
    if (!user) return res.status(400).send("invalid link or expired");

    const token = await TokenModel.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send("Invalid link or expired");

    user.password = req.body.password;
    await user.save();
    await token.delete();

    res.send("password reset successfully.");
  } catch (error) {
    res.send("An error occurred");
  }
});

module.exports = router;
