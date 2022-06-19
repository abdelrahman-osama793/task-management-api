const express = require("express");
const UserModel = require("../models/user_model");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const router = express.Router();
const {
  signupView,
  loginView,
  logoutView,
  logoutAllView,
  userProfileView,
  updateUserProfileView,
  deleteProfileView,
} = require("../controllers/user_controller");

router.post("/signup", signupView);

router.post("/login", loginView);

router.post("/logout", auth, logoutView);

router.post("/logoutAll", auth, logoutAllView);

router.get("/profile", auth, userProfileView);

router.patch("/profile", auth, updateUserProfileView);

router.delete("/profile", auth, deleteProfileView);

const upload = multer({
  // dest: "avatars",
  limits: {
    fileSize: 2500000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/profile/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send({ message: "Photo Added Successfully" });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/profile/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send({ message: "Photo Deleted Successfully" });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/:id/avatar", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user || !user.avatar) {
      console.log(user);
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send({ message: "Avatar Fetched Successfully", avatar: user.avatar });
  } catch (e) {
    res.status(404).send({ message: "404 Not Found" });
  }
});

module.exports = router;
