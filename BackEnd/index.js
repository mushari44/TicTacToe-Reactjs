const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "HEAD"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const mongoURI =
  "mongodb+srv://musharizh56:admin@cluster0.clvs4os.mongodb.net/TicTacToe";

mongoose
  .connect(process.env.MONGODB_URI || mongoURI)
  .then(async () => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB: ", error);
  });

const gameSchema = new mongoose.Schema({
  squares: {
    type: [String],
    default: Array(9).fill(""),
  },
  playerX: {
    type: String,
    default: true,
    required: true,
  },
  playerO: {
    type: String,
    default: false,
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
// const Game = mongoose.model("Game", gameSchema);

app.get("/", async (req, res) => {
  try {
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
      await game.save();
    }
    res.status(200).json([game]);
  } catch (error) {
    let game = await Game.findOne();
    game = new Game();
    await game.save();
    console.log("DONE");
    res.status(500).json({ error: "Error fetching game" });
  }
});

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
app.put("/update-game", async (req, res) => {
  const { id, squares, isXTurn, isGameOver } = req.body;
  try {
    const game = await Game.findById(id);
    if (game) {
      game.squares = squares;
      game.isXTurn = isXTurn;
      game.isGameOver = isGameOver;
      await game.save();
      io.emit("gameUpdated", game); // Emitting the game update event
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
