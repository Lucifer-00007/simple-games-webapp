
"use client"
import React, { useEffect } from 'react';

const TypingGame = () => {
  useEffect(() => {
    const typingGame = () => {
      const word = document.getElementById("word");
      const text = document.getElementById("text");
      const scoreElement = document.getElementById("score");
      const timeElement = document.getElementById("time");
      const endgameElement = document.getElementById("end-game-container");
      const settingsButton = document.getElementById("settings-btn");
      const settings = document.getElementById("settings");
      const settingsForm = document.getElementById("settings-form");
      const difficultySelect = document.getElementById("difficulty");

      const words = [
        "sigh", "tense", "airplane", "ball", "pies", "juice", "warlike", "bad", "north", "dependent", "steer", "silver", "highfalutin", "superficial", "quince", "eight", "feeble", "admit", "drag", "loving",
      ];

      let randomWord;
      let score = 0;
      let time = 10;
      let difficulty = localStorage.getItem("difficulty") !== null ? localStorage.getItem("difficulty") : "medium";

      const timeInterval = setInterval(updateTime, 1000);

      function getRandomWord() {
        return words[Math.floor(Math.random() * words.length)];
      }

      function addWordToDom() {
        randomWord = getRandomWord();
        word.innerText = randomWord;
      }

      function updateScore() {
        score++;
        scoreElement.innerText = score;
      }

      function updateTime() {
        time--;
        timeElement.innerText = time + "s";
        if (time === 0) {
          clearInterval(timeInterval);
          gameOver();
        }
      }

      function gameOver() {
        endgameElement.innerHTML = `
          <h1>Time ran out</h1>
          <p>Your final score is ${score}</p>
          <button onclick="history.go(0)">Play Again</button>
        `;
        endgameElement.style.display = "flex";
      }

      text.addEventListener("input", (e) => {
        const insertedText = e.target.value;
        if (insertedText === randomWord) {
          e.target.value = "";
          addWordToDom();
          updateScore();
          if (difficulty === "hard") time += 2;
          else if (difficulty === "medium") time += 3;
          else time += 5;
          updateTime();
        }
      });

      settingsButton.addEventListener("click", () =>
        settings.classList.toggle("hide")
      );
      settingsForm.addEventListener("change", (e) => {
        difficulty = e.target.value;
        localStorage.setItem("difficulty", difficulty);
      });

      difficultySelect.value = difficulty;
      addWordToDom();
      text.focus();
    };

    typingGame();
  }, []);

  return (
    <>
      <button id="settings-btn" className="settings-btn">
        <i className="fas fa-cog"></i>
      </button>
      <div className="settings" id="settings">
        <form id="settings-form">
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </form>
      </div>
      <div className="container">
        <h2>👩‍💻 Speed Typer 👨‍💻</h2>
        <small>Type the following:</small>
        <h1 id="word"></h1>
        <input
          type="text"
          id="text"
          autoComplete="off"
          placeholder="Type the word here..."
        />
        <p className="time-container">Time left: <span id="time">10s</span></p>
        <p className="score-container">Score: <span id="score">0</span></p>
        <div id="end-game-container" className="end-game-container"></div>
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne+Mono&display=swap');

        :root {
          --primary-color: #BBE0EF;
          --secondary-color: #06599F;
          --overlay-color: #1A1314;
          --gradient-color: #F2F3F4;
          --text-color: #F0F0ED;
          --border-radius: 0.5rem;
        }

        * {
          box-sizing: border-box;
        }

        body {
          background-color: var(--primary-color);
          background-image: linear-gradient(315deg, var(--primary-color) 0%, var(--gradient-color) 100%);
          font-family: "Syne Mono", monospace;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          overflow: hidden;
          margin: 0;
        }

        button {
          cursor: pointer;
          font-size: 14px;
          font-family: inherit;
          border-radius: var(--border-radius);
          padding: 10px 15px;
          border: none;
        }

        button:hover {
          color: var(--text-color);
          background-color: var(--overlay-color);
        }

        button:active {
          transform: scale(0.98);
        }

        select {
          width: 200px;
          padding: 5px;
          font-family: inherit;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          border-radius: var(--border-radius);
          background-color: var(--gradient-color);
        }

        select:focus,
        button:focus, input:focus {
          outline: 0;
        }

        .settings-btn {
          position: absolute;
          bottom: 30px;
          right: 30px;
        }

        .settings {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background-color: var(--overlay-color);
          color: var(--text-color);
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(0);
          transition: transform 0.3s ease-in-out;
        }

        .settings.hide {
          transform: translateY(-100%);
        }

        .container {
          background-color: var(--secondary-color);
          padding: 20px;
          border-radius: var(--border-radius);
          box-shadow: 0 3px 5px var(--overlay-color);
          color: var(--text-color);
          position: relative;
          text-align: center;
          width: 500px;
          max-width: 90vw;
        }

        h1 {
          margin: 0;
        }

        h2 {
          background-color: var(--overlay-color);
          padding: 8px;
          border-radius: var(--border-radius);
          margin: 0 0 40px;
        }

        input {
          border: 0;
          border-radius: var(--border-radius);
          font-size: 14px;
          width: 300px;
          padding: 12px 20px;
          margin-top: 10px;
        }

        .score-container {
          position: absolute;
          top: 60px;
          right: 20px;
        }

        .time-container {
          position: absolute;
          top: 60px;
          left: 20px;
        }

        .end-game-container {
          background-color: inherit;
          border-radius: inherit;
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default TypingGame;
