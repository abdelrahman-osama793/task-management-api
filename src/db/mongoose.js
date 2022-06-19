const mongoose = require("mongoose");

const connectionURL = process.env.DB;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

mongoose
  .connect(connectionURL, connectionParams)
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Unable to Connect");
  });
