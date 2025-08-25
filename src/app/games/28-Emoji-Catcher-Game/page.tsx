
"use client"
import React, { useEffect } from 'react';

const EmojiCatcherGame = () => {
  useEffect(() => {
    const emojiCatcherGame = () => {
      const squares = document.querySelectorAll(".square");
      const timeLeft = document.querySelector("#time-left");
      const score = document.querySelector("#score");

      let result = 0;
      let hitPosition: string | null;
      let currentTime = 60;
      let timerId: NodeJS.Timeout | null = null;
      let countDownTimerId: NodeJS.Timeout | null = null;

      function randomSquare() {
        squares.forEach((square) => {
          square.classList.remove("emoji");
        });

        let randomSqaure = squares[Math.floor(Math.random() * 9) + 1];
        randomSqaure.classList.add("emoji");
        hitPosition = randomSqaure.id;
      }

      squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
          if (square.id == hitPosition) {
            result++;
            score!.textContent = result.toString();
            hitPosition = null;
          }
        });
      });

      function moveEmoji() {
        timerId = setInterval(randomSquare, 500);
      }

      moveEmoji();

      function countDown() {
        currentTime--;
        timeLeft!.textContent = currentTime.toString();

        if (currentTime == 0) {
          clearInterval(countDownTimerId!); // Use non-null assertion operator
          clearInterval(timerId!); // Use non-null assertion operator
          alert(`Game Over! Your final Score Is ${result}`);
        }
      }

      countDownTimerId = setInterval(countDown, 1000);
    };

    emojiCatcherGame();
  }, []);

  return (
    <>
      <div className="scores-container">
        <div className="total-score">
          <h2>Your Score:</h2>
          <h2 id="score">0</h2>
        </div>

        <div className="time">
          <h2>Time left:</h2>
          <h2 id="time-left">60</h2>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid">
          <div className="square" id="1"></div>
          <div className="square" id="2"></div>
          <div className="square" id="3"></div>
          <div className="square" id="4"></div>
          <div className="square" id="5"></div>
          <div className="square" id="6"></div>
          <div className="square" id="7"></div>
          <div className="square" id="8"></div>
          <div className="square" id="9"></div>
          <div className="square" id="10"></div>
        </div>
      </div>
      <style jsx>{`
        body {
          background: rgb(10, 10, 10);
          color: #fff;
          font-family: sans-serif;
        }

        .scores-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .total-score {
          margin-right: 20px;
          margin: 20px;
          text-align: center;
          background: #ccc;
          padding: 20px;
          color: #000;
        }

        .time {
          margin-right: 20px;
          margin: 20px;
          text-align: center;
          background: #ccc;
          padding: 20px;
          color: #000;
        }

        .grid-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .grid {
          width: 90%;
          height: 90%;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          background-color: rgb(36, 36, 36);
          margin-top: 2rem;
          padding: 20px;
        }

        .square {
          height: 200px;
          width: 200px;
          margin: 10px;
          background: rgb(61, 61, 61);
        }

        .emoji {
          background-image: url("https://i.guim.co.uk/img/media/a1b7129c950433c9919f5670c92ef83aa1c682d9/55_344_1971_1183/master/1971.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=88ba2531f114b9b58b9cb2d8e723abe1");
          background-position: center;
          background-size: cover;
        }
      `}</style>
    </>
  );
};

export default EmojiCatcherGame;
