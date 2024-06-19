const connectToDatabase = require("./connect");
const Game = require("./gameModel"); // Your mongoose model

module.exports = async (req, res) => {
  await connectToDatabase();
  const { id } = req.body;
  const game = await Game.findById(id);
  if (game) {
    game.squares = Array(9).fill("");
    game.isXTurn = true;
    game.isGameOver = false;
    await game.save();
    res.status(200).json(game);
  } else {
    res.status(404).json({ error: "Game not found" });
  }
};
    