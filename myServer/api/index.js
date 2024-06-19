const mongoose = require("mongoose");
const { Server } = require("socket.io");

const mongoURI = process.env.MONGODB_URI;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const gameSchema = new mongoose.Schema({
  squares: {
    type: [String],
    default: Array(9).fill(""),
  },
  isXTurn: {
    type: Boolean,
    default: true,
  },
  isGameOver: {
    type: Boolean,
    default: false,
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
