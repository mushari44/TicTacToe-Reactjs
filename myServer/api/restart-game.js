const Game = require("./index");

module.exports = async (req, res) => {
  const { id } = req.body;
  try {
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
  } catch (error) {
    res.status(500).json({ error: "Error restarting game" });
  }
};
