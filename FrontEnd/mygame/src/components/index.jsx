import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./styles.css";

const socket = io("https://tictactoe-server-n239.onrender.com/");

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
  const [gameId, setGameId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await axios.get(
          "https://tictactoe-server-n239.onrender.com/"
        );
        const game = response.data[0];
        if (game) {
          setSquares(game.squares);
          setGameId(game._id);
          setIsXTurn(game.isXTurn);
          setGameOver(game.isGameOver);
          setMessage(
            game.isGameOver
              ? "Game OVER!!"
              : `Next turn is ${game.isXTurn ? "X" : "O"}`
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false); 
      }
    }

    fetchGame();

    socket.on("gameUpdated", (game) => {
      setSquares(game.squares);
      setIsXTurn(game.isXTurn);
      setGameOver(game.isGameOver);
      setMessage(
        game.isGameOver
          ? "Game OVER!"
          : `Next turn is ${game.isXTurn ? "X" : "O"}`
      );
    });

    return () => {
      socket.off("gameUpdated");
    };
  }, []);

  useEffect(() => {
    const winner = getWinner(squares);
    if (winner) {
      setMessage(`${winner} won!!`);
      setGameOver(true);
    } else if (!squares.includes("")) {
      setMessage("DRAW !");
      setGameOver(true);
    } else {
      setMessage(`Next turn is ${isXTurn ? "X" : "O"}`);
    }
  }, [squares]);

  async function handleOnClick(index) {
    if (!gameOver && squares[index] === "") {
      const newSquares = [...squares];
      newSquares[index] = isXTurn ? "X" : "O";
      setSquares(newSquares);
      const newTurn = !isXTurn;
      setIsXTurn(newTurn);

      try {
        await axios.put(
          "https://tictactoe-server-n239.onrender.com/update-game",
          {
            id: gameId,
            squares: newSquares,
            isXTurn: newTurn,
            isGameOver: !!getWinner(newSquares) || !newSquares.includes(""),
          }
        );
      } catch (error) {
        console.log("Error updating game:", error);
      }
    } else if (!gameOver) {
      setMessage("Square already clicked");
    }
  }

  async function handleRestart() {
    try {
      await axios.put(
        "https://tictactoe-server-n239.onrender.com/restart-game",
        {
          id: gameId,
        }
      );
      // No need to manually update state here; wait for socket event
    } catch (error) {
      console.log("Error restarting game:", error);
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

  return (
    <div className="tic-tac-toe-container">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
