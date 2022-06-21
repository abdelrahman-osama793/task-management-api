const UserModel = require("../models/user_model");

const signupView = async (req, res) => {
  const user = new UserModel(req.body);
  try {
    await user.save();
    res.status(201).send({ message: "Account created successfully", user });
  } catch (e) {
    if (e.code === 11000 && e.keyPattern.email === 1)
      res.status(400).send({ message: "Email Already exists" });
  }
};

const loginView = async (req, res) => {
  try {
    const user = await UserModel.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();
    res.status(200).send({ message: "Logged in successfully", user, token });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
};

const logoutView = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({
      message: "Logged out successfully",
    });
  } catch (e) {
    res.status(500).send();
  }
};

const logoutAllView = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};

const userProfileView = async (req, res) => {
  res.send(req.user);
};

const updateUserProfileView = async (req, res) => {
  const _id = req.params.id;
  const requiredUpdates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "email", "age"];
  //.every() takes a callback function and this function gets called to every item in the array
  const isValidOperation = requiredUpdates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Field not available" });
  }

  try {
    const user = req.user;
    requiredUpdates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
};

const deleteProfileView = async (req, res) => {
  try {
    const user = req.user;
    await req.user.remove();
    res.status(200).send({ message: "Account Deleted successfully", user });
  } catch (e) {
    res.status(500).send(e);
  }
};

const sendResetPasswordEmailView = async (req, res) => {
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
        token: user.generateAuthToken,
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
}

const resetPasswordView = async (req, res) => {
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
}

module.exports = {
  signupView,
  loginView,
  logoutView,
  logoutAllView,
  userProfileView,
  updateUserProfileView,
  deleteProfileView,
  sendResetPasswordEmailView,
  resetPasswordView
};
