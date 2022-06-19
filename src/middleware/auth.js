const jwt = require("jsonwebtoken");
const userModel = require("../models/user_model");

const auth = async (req, res, next) => {
  try {
    //header authorization contains the required token with an extra word 'Bearer', so we are removing it
    const token = req.header("Authorization").replace("Bearer ", "");
    const verifyToken = jwt.verify(token, "thisistest");
    // it will get the user which has the same _id and has a token equal to the token up above
    const user = await userModel.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    });

    if (!user) {
      throw Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: "Not authenticated" });
  }
};

module.exports = auth;
