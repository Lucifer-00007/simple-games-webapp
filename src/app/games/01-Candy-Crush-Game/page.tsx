
"use client"
import React, { useEffect } from 'react';

const CandyCrushGame = () => {
  useEffect(() => {
    const candyCrushGame = () => {
      const grid = document.querySelector(".grid");
      const scoreDisplay = document.getElementById("score");
      const timerDisplay = document.getElementById("timer");
      const modeSelection = document.getElementById("modeSelection");
      const endlessButton = document.getElementById("endlessMode");
      const timedButton = document.getElementById("timedMode");
      const changeModeButton = document.getElementById("changeMode");

      const width = 8;
      const squares = [];
      let score = 0;
      let currentMode = null;
      let timeLeft = 0;
      let gameInterval = null;
      let timerInterval = null;

      const candyColors = [
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/red-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/blue-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/green-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/yellow-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/orange-candy.png)",
        "url(https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/purple-candy.png)",
      ];

      function createBoard() {
        grid.innerHTML = "";
        squares.length = 0;
        for (let i = 0; i < width * width; i++) {
          const square = document.createElement("div");
          square.setAttribute("draggable", "true");
          square.setAttribute("id", i.toString());
          let randomColor = Math.floor(Math.random() * candyColors.length);
          square.style.backgroundImage = candyColors[randomColor];
          grid.appendChild(square);
          squares.push(square);
        }
        squares.forEach(square => square.addEventListener("dragstart", dragStart));
        squares.forEach(square => square.addEventListener("dragend", dragEnd));
        squares.forEach(square => square.addEventListener("dragover", dragOver));
        squares.forEach(square => square.addEventListener("dragenter", dragEnter));
        squares.forEach(square => square.addEventListener("dragleave", dragLeave));
        squares.forEach(square => square.addEventListener("drop", dragDrop));
      }

      let colorBeingDragged, colorBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;

      function dragStart() {
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
      }

      function dragOver(e) {
        e.preventDefault();
      }

      function dragEnter(e) {
        e.preventDefault();
      }

      function dragLeave() {}

      function dragDrop() {
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
      }

      function dragEnd() {
        let validMoves = [
          squareIdBeingDragged - 1,
          squareIdBeingDragged - width,
          squareIdBeingDragged + 1,
          squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
          squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
          squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
          squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        } else {
          squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
      }

      function moveIntoSquareBelow() {
        for (let i = 0; i < width; i++) {
          if (squares[i].style.backgroundImage === "") {
            let randomColor = Math.floor(Math.random() * candyColors.length);
            squares[i].style.backgroundImage = candyColors[randomColor];
          }
        }
        for (let i = 0; i < width * (width - 1); i++) {
          if (squares[i + width].style.backgroundImage === "") {
            squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
            squares[i].style.backgroundImage = "";
          }
        }
      }

      function checkRowForFour() {
        for (let i = 0; i < 60; i++) {
          if (i % width >= width - 3) continue;
          let rowOfFour = [i, i + 1, i + 2, i + 3];
          let decidedColor = squares[i].style.backgroundImage;
          const isBlank = squares[i].style.backgroundImage === "";
          if (rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 4;
            scoreDisplay.innerHTML = score;
            rowOfFour.forEach(index => squares[index].style.backgroundImage = "");
          }
        }
      }

      function checkColumnForFour() {
        for (let i = 0; i < 40; i++) {
          let columnOfFour = [i, i + width, i + 2 * width, i + 3 * width];
          let decidedColor = squares[i].style.backgroundImage;
          const isBlank = squares[i].style.backgroundImage === "";
          if (columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 4;
            scoreDisplay.innerHTML = score;
            columnOfFour.forEach(index => squares[index].style.backgroundImage = "");
          }
        }
      }

      function checkRowForThree() {
        for (let i = 0; i < 62; i++) {
          if (i % width >= width - 2) continue;
          let rowOfThree = [i, i + 1, i + 2];
          let decidedColor = squares[i].style.backgroundImage;
          const isBlank = squares[i].style.backgroundImage === "";
          if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 3;
            scoreDisplay.innerHTML = score;
            rowOfThree.forEach(index => squares[index].style.backgroundImage = "");
          }
        }
      }

      function checkColumnForThree() {
        for (let i = 0; i < 48; i++) {
          let columnOfThree = [i, i + width, i + 2 * width];
          let decidedColor = squares[i].style.backgroundImage;
          const isBlank = squares[i].style.backgroundImage === "";
          if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
            score += 3;
            scoreDisplay.innerHTML = score;
            columnOfThree.forEach(index => squares[index].style.backgroundImage = "");
          }
        }
      }

      function gameLoop() {
        checkRowForFour();
        checkColumnForFour();
        checkRowForThree();
        checkColumnForThree();
        moveIntoSquareBelow();
      }

      function startGame(mode) {
        currentMode = mode;
        modeSelection.style.display = "none";
        grid.style.display = "flex";
        scoreDisplay.parentElement.style.display = "flex";
        createBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        gameInterval = setInterval(gameLoop, 100);

        if (mode === "timed") {
          timeLeft = 120;
          updateTimerDisplay();
          timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
              clearInterval(timerInterval);
              endGame();
            }
          }, 1000);
        } else {
          timerDisplay.innerHTML = "";
        }
      }

      function updateTimerDisplay() {
        if (currentMode === "timed") {
          let minutes = Math.floor(timeLeft / 60);
          let seconds = timeLeft % 60;
          timerDisplay.innerHTML = `Time Left: ${minutes}:${seconds.toString().padStart(2, "0")}`;
        } else {
          timerDisplay.innerHTML = "";
        }
      }

      function endGame() {
        clearInterval(gameInterval);
        squares.forEach(square => square.setAttribute("draggable", "false"));
        alert(`Time's Up! Your score is ${score}`);
      }

      function changeMode() {
        clearInterval(gameInterval);
        if (currentMode === "timed") {
          clearInterval(timerInterval);
        }
        grid.style.display = "none";
        scoreDisplay.parentElement.style.display = "none";
        modeSelection.style.display = "flex";
      }

      endlessButton.addEventListener("click", () => startGame("endless"));
      timedButton.addEventListener("click", () => startGame("timed"));
      changeModeButton.addEventListener("click", changeMode);
    };

    candyCrushGame();
  }, []);

  return (
    <>
      <div id="modeSelection">
        <h2>Choose Game Mode</h2>
        <button id="endlessMode">Endless Mode</button>
        <button id="timedMode">Timed Mode</button>
      </div>
      <div className="scoreBoard">
        <h3>score</h3>
        <h1 id="score">0</h1>
        <div id="timer"></div>
        <button id="changeMode">Change Mode</button>
      </div>
      <div className="grid"></div>
      <style jsx>{`
        body {
          background-image: url('https://raw.githubusercontent.com/arpit456jain/Amazing-Js-Projects/master/Candy%20Crush/utils/bg.png');
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Montserrat', sans-serif;
          color: #85796b;
        }
        .grid {
          display: flex;
          flex-wrap: wrap;
          height: 560px;
          width: 560px;
          background-color: rgba(109, 127, 151, 0.5);
          padding: 5px;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5) inset, 0 1px 0 #fff;
          margin-left: 80px;
          margin-top: 50px;
        }
        .grid div {
          height: 70px;
          width: 70px;
          background-size: cover;
          background-position: center;
          border-radius: 5px;
          transition: transform 0.2s ease;
        }
        .grid div:hover {
          transform: scale(1.05);
        }
        .scoreBoard {
          background-color: cyan;
          border-radius: 20px;
          margin-top: 200px;
          margin-left: 200px;
          width: auto;
          height: 120px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          color: #85796b;
        }
        h3,
        h1 {
          font-family: 'Montserrat', sans-serif;
          text-transform: uppercase;
          margin: 0;
        }
        h1 {
          margin-top: -10px;
        }
        #modeSelection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #f0f0f0;
          font-family: 'Montserrat', sans-serif;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 10;
        }
        #modeSelection h2 {
          margin-bottom: 20px;
          color: #333;
        }
        #modeSelection button {
          margin: 10px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #87ceeb;
          border: none;
          border-radius: 5px;
          color: white;
        }
        #timer {
          font-size: 18px;
          margin-top: 10px;
        }
        #changeMode {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #ff6347;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .grid,
        .scoreBoard {
          display: none;
        }
      `}</style>
    </>
  );
};

export default CandyCrushGame;
