const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

let conn = null;

const connectToDatabase = async () => {
  if (conn == null) {
    conn = mongoose
      .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => mongoose);

    await conn;
  }
  return conn;
};

module.exports = connectToDatabase;
