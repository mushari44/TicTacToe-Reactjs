const connectToDatabase = require("./connect");
const Game = require("./gameModel"); // Your mongoose model

module.exports = async (req, res) => {
  await connectToDatabase();
  let game = await Game.findOne();
  if (!game) {
    game = new Game();
    await game.save();
  }
  res.status(200).json([game]);
};
