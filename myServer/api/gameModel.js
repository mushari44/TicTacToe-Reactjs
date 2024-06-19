const mongoose = require("mongoose");

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

module.exports = mongoose.models.Game || mongoose.model("Game", gameSchema);
