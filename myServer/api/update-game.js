const Game = require("./index");

module.exports = async (req, res) => {
  const { id, squares, isXTurn, isGameOver } = req.body;
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
  }
};
