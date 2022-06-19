const mongoose = require("mongoose");
const validator = require("validator");

const taskSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (validator.isEmpty(value)) {
          throw Error("Please enter a description");
        }
      },
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "userModel",
    },
  },
  {
    timestamps: true,
  }
);

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
