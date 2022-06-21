require("dotenv").config();
const express = require("express");
require("./db/mongoose");
const morgan = require('morgan')

const userRouter = require("./routers/user_router");
const taskRouter = require("./routers/task_router");
const resetPasswordRouter = require("./routers/resetPassword_router");

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'))
app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/reset-password", resetPasswordRouter);

app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});
