const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  squares: {
    type: [String],
    default: Array(9).fill(""),
  },
  playerX: {
    type: String,
    required: true,
  },
  playerO: {
    type: String,
    required: true,
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

// Example routes for handling game logic
// Example of handling moves
app.put("/make-move", async (req, res) => {
  const { gameId, playerId, index } = req.body;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Check whose turn it is and if the player is allowed to make a move
    if (
      (game.isXTurn && playerId !== game.playerX) ||
      (!game.isXTurn && playerId !== game.playerO)
    ) {
      return res.status(403).json({ error: "Not your turn" });
    }

    // Check if the square is empty
    if (game.squares[index] !== "") {
      return res.status(400).json({ error: "Square already filled" });
    }

    // Update game state
    game.squares[index] = game.isXTurn ? "X" : "O";
    game.isXTurn = !game.isXTurn;
    await game.save();

    // Emit event to update frontend clients
    io.emit("gameUpdated", game);

    res.status(200).json(game);
  } catch (error) {
    console.error("Error making move:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Example of restarting game
app.put("/restart-game", async (req, res) => {
  const { gameId } = req.body;
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Reset game state
    game.squares = Array(9).fill("");
    game.isXTurn = true;
    game.isGameOver = false;
    await game.save();

    // Emit event to update frontend clients
    io.emit("gameUpdated", game);

    res.status(200).json(game);
  } catch (error) {
    console.error("Error restarting game:", error);
    res.status(500).json({ error: "Server error" });
  }
});
