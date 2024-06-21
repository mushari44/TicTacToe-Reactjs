const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development; change this for production
    methods: ["GET", "POST"],
  },
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

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    console.log("HELLO");
    let game = await Game.findOne();
    if (!game) {
      game = new Game();
      await game.save();
    }
    res.status(200).json([game]);
  } catch (error) {
    res.status(500).json({ error: "Error fetching game" });
  }
});

app.put("/restart-game", async (req, res) => {
  const { id } = req.body;
  try {
    const game = await Game.findById(id);
    if (game) {
      game.squares = Array(9).fill("");
      game.isXTurn = true;
      game.isGameOver = false;
      await game.save();
      io.emit("gameUpdated", game);
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
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
      io.emit("gameUpdated", game);
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
