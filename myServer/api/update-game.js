const connectToDatabase = require("./connect");
const Game = require("./gameModel"); // Your mongoose model

module.exports = async (req, res) => {
  await connectToDatabase();
  const { id, squares, isXTurn, isGameOver } = req.body;
  const game = await Game.findById(id);
  if (game) {
    game.squares = squares;
    game.isXTurn = isXTurn;
    game.isGameOver = isGameOver;
    await game.save();
    res.status(200).json(game);
  } else {
    res.status(404).json({ error: "Game not found" });
  }
};
