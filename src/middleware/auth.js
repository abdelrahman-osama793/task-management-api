const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model");

const auth = async (req, res, next) => {
  try {
    //header authorization contains the required token with an extra word 'Bearer', so we are removing it
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifiedToken = jwt.verify(token, process.env.TOKENSTRING);
    // it will get the user which has the same _id and has a token equal to the token up above
    const user = await userModel.findOne({
      _id: verifiedToken._id,
      "tokens.token": token,
    });

    if (!user) {
      res.status(403).send({ message: "Not authenticated" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(403).send({ message: "Not authenticated" });
  }
};

module.exports = auth;
