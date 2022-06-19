require("dotenv").config();
const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user_router");
const taskRouter = require("./routers/task_router");
const resetPasswordRouter = require("./routers/resetPassword_router");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/reset-password", resetPasswordRouter);

app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});
