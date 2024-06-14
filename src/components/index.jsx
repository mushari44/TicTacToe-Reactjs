import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

export default function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [isXTurn, setIsXTurn] = useState(true);
  const [message, setMessage] = useState("Next turn is X");
  const [gameOver, setGameOver] = useState(false);
  const [squareId, setSquareId] = useState(null);

  async function fetchGame() {
    try {
      const response = await axios.get("http://127.0.0.1:4000/");
      const game = response.data[0]; // Assuming you want the first game
      if (game) {
        setSquares(game.squares);
        setSquareId(game._id);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  async function handleOnClick(index) {
    if (!gameOver && squares[index] === "") {
      const newSquares = [...squares];
      newSquares[index] = isXTurn ? "X" : "O";
      setSquares(newSquares);
      setIsXTurn(!isXTurn);
      try {
        await axios.put("http://127.0.0.1:4000/update-game", {
          id: squareId,
          squares: newSquares,
        });
      } catch (error) {
        console.log("Error updating game:", error);
      }

      const winner = getWinner(newSquares);
      if (winner) {
        setMessage(`${winner} won!!`);
        setGameOver(true);
      } else if (!newSquares.includes("")) {
        setMessage("DRAW !");
        setGameOver(true);
      } else {
        setMessage(`Next turn is ${!isXTurn ? "X" : "O"}`);
      }
    } else if (!gameOver) {
      setMessage("Square already clicked");
    }
  }

  function getWinner(squares) {
    const winningPatterns = [
      [0, 1, 2],
      [0, 3, 6],
      [3, 4, 5],
      [6, 7, 8],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
      [1, 4, 7],
    ];
    for (let i = 0; i < winningPatterns.length; i++) {
      const [x, y, z] = winningPatterns[i];
      if (
        squares[x] &&
        squares[x] === squares[y] &&
        squares[x] === squares[z]
      ) {
        return squares[x];
      }
    }
    return null;
  }

  useEffect(() => {
    fetchGame();
  });
  async function handleRestart() {
    await axios.put("http://127.0.0.1:4000/restart-game");
    setIsXTurn(true);
    setGameOver(false);
    setMessage("Next turn is X");
    setSquares(Array(9).fill(""));
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
      <button className="restart-button" onClick={handleRestart}>
        RESTART
      </button>
    </div>
  );
}
