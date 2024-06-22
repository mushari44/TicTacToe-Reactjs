import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./styles.css";

const socket = io("https://tictactoe-server.mushari-alothman.uk", {
  withCredentials: true,
});

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

export default function TicTacToe({ playerId }) {
  const [game, setGame] = useState(null); // State to hold the game data
  const [message, setMessage] = useState("Next turn is X");
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState("");
  const [playerO, setPlayerO] = useState("");

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await axios.get(
          "https://tictactoe-server.mushari-alothman.uk/"
        );
        const fetchedGame = response.data[0];
        if (fetchedGame) {
          setGame(fetchedGame); // Set the fetched game data
          setPlayerX(fetchedGame.playerX); // Set player X from game data
          setPlayerO(fetchedGame.playerO); // Set player O from game data
          setMessage(
            fetchedGame.isGameOver
              ? "Game OVER!!"
              : `Next turn is ${fetchedGame.isXTurn ? "X" : "O"}`
          );
          setGameOver(fetchedGame.isGameOver);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchGame();

    socket.on("gameUpdated", (updatedGame) => {
      setGame(updatedGame); // Update the game state with the received update
      setMessage(
        updatedGame.isGameOver
          ? "Game OVER!"
          : `Next turn is ${updatedGame.isXTurn ? "X" : "O"}`
      );
      setGameOver(updatedGame.isGameOver);
    });

    return () => {
      socket.off("gameUpdated");
    };
  }, []);

  async function handleOnClick(index) {
    try {
      if (!gameOver && game && game.squares[index] === "") {
        const newSquares = [...game.squares];
        newSquares[index] = game.isXTurn ? "X" : "O";

        await axios.put(
          "https://tictactoe-server.mushari-alothman.uk/make-move",
          {
            gameId: game._id,
            playerId,
            index,
          }
        );

        // Optimistically update the UI
        setGame((prevGame) => ({
          ...prevGame,
          squares: newSquares,
          isXTurn: !prevGame.isXTurn,
        }));
      }
    } catch (error) {
      console.log("Error making move:", error);
    }
  }

  async function handleRestart() {
    try {
      await axios.put(
        "https://tictactoe-server.mushari-alothman.uk/restart-game",
        {
          gameId: game._id,
        }
      );

      // Reset local game state after restart
      setGame((prevGame) => ({
        ...prevGame,
        squares: Array(9).fill(""),
        isXTurn: true,
        isGameOver: false,
      }));
    } catch (error) {
      console.log("Error restarting game:", error);
    }
  }

  if (!game) {
    return <div>Loading...</div>; // Handle loading state while fetching game
  }

  return (
    <div className="tic-tac-toe-container">
      <div>{message && <h1>{message}</h1>}</div>
      <div className="row">
        <Square value={game.squares[0]} onClick={() => handleOnClick(0)} />
        <Square value={game.squares[1]} onClick={() => handleOnClick(1)} />
        <Square value={game.squares[2]} onClick={() => handleOnClick(2)} />
      </div>
      <div className="row">
        <Square value={game.squares[3]} onClick={() => handleOnClick(3)} />
        <Square value={game.squares[4]} onClick={() => handleOnClick(4)} />
        <Square value={game.squares[5]} onClick={() => handleOnClick(5)} />
      </div>
      <div className="row">
        <Square value={game.squares[6]} onClick={() => handleOnClick(6)} />
        <Square value={game.squares[7]} onClick={() => handleOnClick(7)} />
        <Square value={game.squares[8]} onClick={() => handleOnClick(8)} />
      </div>
      {gameOver ? (
        <button className="restart-button" onClick={handleRestart}>
          RESTART
        </button>
      ) : null}
    </div>
  );
}
