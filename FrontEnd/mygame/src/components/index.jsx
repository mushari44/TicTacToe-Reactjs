import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./styles.css";

const socket = io("https://tictactoe-server.mushari-alothman.uk");

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

export default function TicTacToe({ playerId }) {
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [message, setMessage] = useState("Next turn is X");
  const [gameOver, setGameOver] = useState(false);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await axios.get(
          "https://tictactoe-server.mushari-alothman.uk/"
        );
        const game = response.data[0];
        if (game) {
          setSquares(game.squares);
          setGameId(game._id);
          setMessage(
            game.isGameOver
              ? "Game OVER!!"
              : `Next turn is ${game.isXTurn ? "X" : "O"}`
          );
          setGameOver(game.isGameOver);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchGame();

    socket.on("gameUpdated", (game) => {
      setSquares(game.squares);
      setMessage(
        game.isGameOver
          ? "Game OVER!"
          : `Next turn is ${game.isXTurn ? "X" : "O"}`
      );
      setGameOver(game.isGameOver);
    });

    return () => {
      socket.off("gameUpdated");
    };
  }, []);

  async function handleOnClick(index) {
    if (!gameOver && squares[index] === "") {
      const newSquares = [...squares];
      newSquares[index] = playerId === game.playerX ? "X" : "O";

      try {
        await axios.put(
          "https://tictactoe-server.mushari-alothman.uk/make-move",
          {
            gameId,
            playerId,
            index,
          }
        );
      } catch (error) {
        console.log("Error making move:", error);
      }
    }
  }

  async function handleRestart() {
    try {
      await axios.put(
        "https://tictactoe-server.mushari-alothman.uk/restart-game",
        {
          gameId,
        }
      );
    } catch (error) {
      console.log("Error restarting game:", error);
    }
  }

  return (
    <div className="tic-tac-toe-container">
      <div>{message && <h1>{message}</h1>}</div>
      <div className="row">
        <Square value={squares[0]} onClick={() => handleOnClick(0)} />
        <Square value={squares[1]} onClick={() => handleOnClick(1)} />
        <Square value={squares[2]} onClick={() => handleOnClick(2)} />
      </div>
      <div className="row">
        <Square value={squares[3]} onClick={() => handleOnClick(3)} />
        <Square value={squares[4]} onClick={() => handleOnClick(4)} />
        <Square value={squares[5]} onClick={() => handleOnClick(5)} />
      </div>
      <div className="row">
        <Square value={squares[6]} onClick={() => handleOnClick(6)} />
        <Square value={squares[7]} onClick={() => handleOnClick(7)} />
        <Square value={squares[8]} onClick={() => handleOnClick(8)} />
      </div>
      {gameOver ? (
        <button className="restart-button" onClick={handleRestart}>
          RESTART
        </button>
      ) : null}
    </div>
  );
}
