const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task_model");
const { Buffer } = require("safe-buffer");

// In order to take advantage of the middleware in the models
// it is preferred to create the Schema first and then pass it to the model
// We have two methods pre for doing something before and post for doing something after
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
      trim: true,
      lowercase: true,
      // Custom Validation using validate function in mongoDB and validator package
      validate(value) {
        if (!validator.isEmail(value)) {
          throw Error("Email is not correct");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
      // Custom Validation using Validate function in mongoDB
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw Error("Password can not contain the keyword: 'password'");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      required: true,
      // Custom Validation using Validate function in mongoDB
      validate(value) {
        if (value < 0) {
          throw Error("Age must be positive Number");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id", //el key ely hana w m7tot hnak and in that case it's the user id
  foreignField: "owner", //name of the field on the task
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

// Accessible on the instances (instance methods)
// Once the user is created a token is created for him
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  // sign() function takes two variables the first one is the data that is going to be embedded in the token and the other is the string that is going to be encrypted 
  const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKENSTRING);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// A new function we built specially for logging in users
// Accessible on the model (model methods)
// Find by email and then compare the password to make sure it's the right email and password
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password" );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return user;
};

userSchema.statics.findAndComparePassword = async (_id, password) => {};

// Hash the Password before saving the user to the database//
// There is difference between hashing and encrypting
// Hashing is one way while encryption is two ways we can decrypt the value as long as we have the key
userSchema.pre("save", async function (next) {
  // this plays as the saved document
  const user = this;
  // check if password is modified to hash it for the first time or to re-hash it
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  // We simply call next when we are done to let the code know that we finished the function
  next();
});

// Remove the user's tasks
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
