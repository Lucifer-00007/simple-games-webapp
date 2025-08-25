
"use client"
import React, { useEffect } from 'react';

const SimonSaysGame = () => {
  useEffect(() => {
    const simonSaysGame = () => {
      const colors = ["green", "red", "yellow", "blue"];
      let gamePattern: string[] = [];
      let userPattern: string[] = [];
      let level = 0;
      let clickCount = 0;
      let gameStarted = false;

      const startButton = document.getElementById("start-btn");
      if (startButton) {
        startButton.addEventListener("click", startGame);
      }

      function startGame() {
        if (!gameStarted) {
          gameStarted = true;
          level = 0;
          gamePattern = [];
          userPattern = [];
          clickCount = 0;
          const statusElement = document.getElementById("status");
          if (statusElement) statusElement.textContent = `Level ${level}`;
          const clickCountElement = document.getElementById("click-count");
          if (clickCountElement) clickCountElement.textContent = clickCount.toString();

          showMyTexts();
          nextSequence();
        }
      }

      function nextSequence() {
        userPattern = [];
        clickCount = 0;
        const clickCountElement = document.getElementById("click-count");
        if (clickCountElement) clickCountElement.textContent = clickCount.toString();
        level++;
        const statusElement = document.getElementById("status");
        if (statusElement) statusElement.textContent = `Level ${level}`;

        const sequenceDisplay = document.getElementById("sequence-display");
        if (sequenceDisplay) sequenceDisplay.textContent = "-";

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        gamePattern.push(randomColor);

        animateSequence();
      }

      function animateSequence() {
        let i = 0;
        const interval = setInterval(() => {
          flashButton(gamePattern[i]);
          i++;
          if (i === gamePattern.length) {
            clearInterval(interval);
            enableUserInput();
          }
        }, 600);
      }

      function flashButton(color: string) {
        const button = document.getElementById(color);
        if (button) {
          button.classList.add("active");
          setTimeout(() => {
            button.classList.remove("active");
          }, 300);
        }
      }

      function enableUserInput() {
        colors.forEach((color) => {
          const button = document.getElementById(color);
          if (button) {
            button.addEventListener("click", handleUserClick);
          }
        });
      }

      function disableUserInput() {
        colors.forEach((color) => {
          const button = document.getElementById(color);
          if (button) {
            button.removeEventListener("click", handleUserClick);
          }
        });
      }

      function handleUserClick(event: MouseEvent) {
        const clickedColor = (event.target as HTMLElement).id;
        userPattern.push(clickedColor);
        flashButton(clickedColor);
        clickCount++;
        const clickCountElement = document.getElementById("click-count");
        if (clickCountElement) clickCountElement.textContent = clickCount.toString();

        const sequenceDisplay = document.getElementById("sequence-display");
        if (sequenceDisplay) {
          sequenceDisplay.innerHTML = "";
          userPattern.forEach((color) => {
            const span = document.createElement("span");
            span.style.color = color;
            span.textContent = color.toUpperCase() + " ";
            sequenceDisplay.appendChild(span);
          });
        }

        checkAnswer(userPattern.length - 1);
      }

      function checkAnswer(currentLevel: number) {
        if (userPattern[currentLevel] === gamePattern[currentLevel]) {
          if (userPattern.length === gamePattern.length) {
            disableUserInput();
            setTimeout(() => {
              showCongratsMessage();
              setTimeout(() => {
                hideCongratsMessage();
                setTimeout(() => { }, 1000);
                nextSequence();
              }, 2000);
            }, 1000);
          }
        } else {
          const statusElement = document.getElementById("status");
          if (statusElement) statusElement.textContent = `Game Over!`;

          // Assuming missedColor is defined elsewhere or derived from gamePattern
          // For now, let's just use a placeholder if it's not directly available
          const missedColor = gamePattern[userPattern.length - 1]; // This might be undefined if userPattern is empty
          if (missedColor) {
            setTimeout(() => {
              flashButton(missedColor);
            }, 1000);
          }

          setTimeout(() => {
            hideMyTexts();
          }, 1000);

          showLoseMessage();
          setTimeout(() => {
            hideLoseMessage();
          }, 2000);

          gameStarted = false;

          setTimeout(() => {
            level = 0;
            gamePattern = [];
            const sequenceDisplay = document.getElementById("sequence-display");
            if (sequenceDisplay) sequenceDisplay.textContent = "-";
            const clickCountElement = document.getElementById("click-count");
            if (clickCountElement) clickCountElement.textContent = "0";
          }, 1500);
        }
      }

      function showCongratsMessage() {
        const message = `Congrats! You passed level ${level}!`;
        const congratsMessageElement = document.getElementById("level-message");
        if (congratsMessageElement) {
          congratsMessageElement.textContent = message;
          congratsMessageElement.style.display = "block";
          setTimeout(() => {
            congratsMessageElement.classList.add("show");
          }, 50);
        }
      }

      function hideCongratsMessage() {
        const congratsMessageElement = document.getElementById("level-message");
        if (congratsMessageElement) {
          congratsMessageElement.classList.remove("show");
          setTimeout(() => {
            congratsMessageElement.style.display = "none";
          }, 1000);
        }
      }

      function showLoseMessage() {
        const message = `Game Over! Correct color was ${gamePattern[userPattern.length - 1] || ''}.`;
        const loseMessageElement = document.getElementById("level-message");
        if (loseMessageElement) {
          loseMessageElement.textContent = message;
          loseMessageElement.style.color = "red";
          loseMessageElement.style.display = "block";
          setTimeout(() => {
            loseMessageElement.classList.add("show");
          }, 50);
        }
      }

      function hideLoseMessage() {
        const loseMessageElement = document.getElementById("level-message");
        if (loseMessageElement) {
          loseMessageElement.classList.remove("show");
          setTimeout(() => {
            loseMessageElement.style.display = "none";
          }, 1000);
        }
      }

      function showMyTexts() {
        const texts = document.getElementsByClassName("my-text");
        for (let i = 0; i < texts.length; i++) {
          (texts[i] as HTMLElement).style.display = "block";
          texts[i].classList.add("show");
        }
      }

      function hideMyTexts() {
        const texts = document.getElementsByClassName("my-text");
        for (let i = 0; i < texts.length; i++) {
          texts[i].classList.remove("show");
          (texts[i] as HTMLElement).style.display = "none";
        }
      }
    };

    simonSaysGame();
  }, []);

  return (
    <>
      <h1>Simon Says Game</h1>
      <div id="game-container">
        <div className="color-btn" id="green"></div>
        <div className="color-btn" id="red"></div>
        <div className="color-btn" id="yellow"></div>
        <div className="color-btn" id="blue"></div>
      </div>
      <div id="game-status">
        <p className="my-text" id="sequence" style={{ display: "none" }}>
          Current Sequence: <span id="sequence-display">-</span>
        </p>
        <p className="my-text" id="clicks" style={{ display: "none" }}>
          Click Count: <span id="click-count">0</span>
        </p>
        <p className="my-text" id="status" style={{ display: "none" }}>
          Game Status: <span id="status">Waiting...</span>
        </p>
      </div>
      <button id="start-btn">Start Game</button>
      <p id="level-message" style={{ display: "none" }}></p>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          background-color: #f4f4f9;
          text-align: center;
          padding: 50px;
        }

        h1 {
          font-size: 3rem;
          margin-bottom: 30px;
          color: #333;
        }

        #game-container {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .color-btn {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          margin: 10px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }

        #green {
          background-color: green;
        }

        #red {
          background-color: red;
        }

        #yellow {
          background-color: yellow;
        }

        #blue {
          background-color: blue;
        }

        .color-btn.active {
          transform: scale(1.1);
        }

        #game-status {
          margin-top: 20px;
          font-size: 1.2rem;
          color: #333;
        }

        #start-btn {
          margin-top: 20px;
          padding: 10px 20px;
          font-size: 1.2rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        #start-btn:hover {
          background-color: #45a049;
        }

        #status {
          font-weight: bold;
        }

        #level-message {
          font-size: 24px;
          font-weight: bold;
          color: green;
          text-align: center;
          margin-top: 20px;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          display: none;
        }

        #level-message.show {
          opacity: 1;
          display: block;
        }

        .my-text {
          font-size: 1.5rem;
          margin-top: 20px;
          color: #333;
          opacity: 0;
          transition: opacity 0.5s ease-in-out;
          display: none;
        }
        .my-text.show {
          opacity: 1;
          display: block;
          transition: opacity 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default SimonSaysGame;
