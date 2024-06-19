const Game = require("./index");

module.exports = async (req, res) => {
  try {
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
      await game.save();
    }
    res.status(200).json([game]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching game" });
  }
};
