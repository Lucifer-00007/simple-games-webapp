
"use client"
import React, { useEffect } from 'react';

const SnakeGame = () => {
  useEffect(() => {
    const snakeGame = () => {
      const playBoard = document.querySelector(".play-board");
      const scoreElement = document.querySelector(".score");
      const highScoreElement = document.querySelector(".high-score");
      const controls = document.querySelectorAll(".controls i");

      let gameOver = false;
      let foodX, foodY;
      let snakeX = 5, snakeY = 5;
      let velocityX = 0, velocityY = 0;
      let snakeBody = [];
      let setIntervalId;
      let score = 0;

      let highScore = localStorage.getItem("high-score") || 0;
      highScoreElement.innerText = `High Score: ${highScore}`;

      const updateFoodPosition = () => {
        foodX = Math.floor(Math.random() * 30) + 1;
        foodY = Math.floor(Math.random() * 30) + 1;
      }

      const handleGameOver = () => {
        clearInterval(setIntervalId);
        alert("Game Over! Press OK to replay...");
        location.reload();
      }

      const changeDirection = e => {
        if (e.key === "ArrowUp" && velocityY != 1) {
          velocityX = 0;
          velocityY = -1;
        } else if (e.key === "ArrowDown" && velocityY != -1) {
          velocityX = 0;
          velocityY = 1;
        } else if (e.key === "ArrowLeft" && velocityX != 1) {
          velocityX = -1;
          velocityY = 0;
        } else if (e.key === "ArrowRight" && velocityX != -1) {
          velocityX = 1;
          velocityY = 0;
        }
      }

      controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

      const initGame = () => {
        if (gameOver) return handleGameOver();
        let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

        if (snakeX === foodX && snakeY === foodY) {
          updateFoodPosition();
          snakeBody.push([foodY, foodX]);
          score++;
          highScore = score >= highScore ? score : highScore;
          localStorage.setItem("high-score", highScore);
          scoreElement.innerText = `Score: ${score}`;
          highScoreElement.innerText = `High Score: ${highScore}`;
        }
        snakeX += velocityX;
        snakeY += velocityY;

        for (let i = snakeBody.length - 1; i > 0; i--) {
          snakeBody[i] = snakeBody[i - 1];
        }
        snakeBody[0] = [snakeX, snakeY];

        if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
          return gameOver = true;
        }

        for (let i = 0; i < snakeBody.length; i++) {
          html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
          if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
          }
        }
        playBoard.innerHTML = html;
      }

      updateFoodPosition();
      setIntervalId = setInterval(initGame, 100);
      document.addEventListener("keyup", changeDirection);
    };

    snakeGame();
  }, []);

  return (
    <>
      <div className="wrapper">
        <div className="game-details">
          <span className="score">Score: 0</span>
          <span className="high-score">High Score: 0</span>
        </div>
        <div className="play-board"></div>
        <div className="controls">
          <i data-key="ArrowLeft" className="fa-solid fa-arrow-left-long"></i>
          <i data-key="ArrowUp" className="fa-solid fa-arrow-up-long"></i>
          <i data-key="ArrowRight" className="fa-solid fa-arrow-right-long"></i>
          <i data-key="ArrowDown" className="fa-solid fa-arrow-down-long"></i>
        </div>
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Open Sans', sans-serif;
        }
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #E3F2FD;
        }
        .wrapper {
          width: 65vmin;
          height: 70vmin;
          display: flex;
          overflow: hidden;
          flex-direction: column;
          justify-content: center;
          border-radius: 5px;
          background: #293447;
          box-shadow: 0 20px 40px rgba(52, 87, 220, 0.2);
        }
        .game-details {
          color: #B8C6DC;
          font-weight: 500;
          font-size: 1.2rem;
          padding: 20px 27px;
          display: flex;
          justify-content: space-between;
        }
        .play-board {
          height: 100%;
          width: 100%;
          display: grid;
          background: #212837;
          grid-template: repeat(30, 1fr) / repeat(30, 1fr);
        }
        .play-board .food {
          background: #FF003D;
        }
        .play-board .head {
          background: #60CBFF;
        }
        .controls {
          display: none;
          justify-content: space-between;
        }
        .controls i {
          padding: 25px 0;
          text-align: center;
          font-size: 1.3rem;
          color: #B8C6DC;
          width: calc(100% / 4);
          cursor: pointer;
          border-right: 1px solid #171B26;
        }
        @media screen and (max-width: 800px) {
          .wrapper {
            width: 90vmin;
            height: 115vmin;
          }
          .game-details {
            font-size: 1rem;
            padding: 15px 27px;
          }
          .controls {
            display: flex;
          }
          .controls i {
            padding: 15px 0;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default SnakeGame;
