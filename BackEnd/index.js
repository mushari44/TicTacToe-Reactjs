const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://musharizh56:admin@cluster0.clvs4os.mongodb.net/TicTacToe";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
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
});

const Game = mongoose.model("Game", gameSchema);

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
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
});

app.put("/restart-game", async (req, res) => {
  const { id } = req.body;
  try {
    const game = await Game.findById(id);
    if (game) {
      game.squares = Array(9).fill("");
      game.isXTurn = true;
      await game.save();
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
  }
});

app.put("/update-game", async (req, res) => {
  const { id, squares, isXTurn } = req.body;
  try {
    const game = await Game.findById(id);
    if (game) {
      game.squares = squares;
      game.isXTurn = isXTurn;
      await game.save();
      res.status(200).json(game);
    } else {
      res.status(404).json({ error: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating game" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
