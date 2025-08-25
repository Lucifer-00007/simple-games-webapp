
"use client"
import React, { useEffect } from 'react';

const TicTacToeGame = () => {
  useEffect(() => {
    const ticTacToeGame = () => {
      const boxEls = document.querySelectorAll('.box');
      const statusEl = document.querySelector('.status');
      const restartBtnEl = document.querySelector('.restartBtn');
      let x = "<img src='/games/13-Tic-Tac-Toe/images/X-Player.png'>";
      let o = "<img src='/games/13-Tic-Tac-Toe/images/O-Player.png'>";

      const win = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];

      let options = ["", "", "", "", "", "", "", "", ""];
      let currentPlayer = x;
      let player = "X";
      let running = false;
      init();

      function init() {
        boxEls.forEach(box => box.addEventListener('click', boxClick));
        restartBtnEl.addEventListener('click', restartGame);
        statusEl.textContent = `Now "${player}" Turn`;
        running = true;
      }

      function boxClick(e) {
        const index = e.target.dataset.index;
        if (options[index] != "" || !running) {
          return;
        }
        updateBox(e.target, index);
        checkWinner();
      }

      function updateBox(box, index) {
        options[index] = player;
        box.innerHTML = currentPlayer;
      }

      function changePlayer() {
        player = (player == 'X') ? "O" : "X";
        currentPlayer = (currentPlayer == x) ? o : x;
        statusEl.textContent = `Now "${player}" Turn`;
        statusEl.style.color = "black"
      }

      function restartGame() {
        options = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = x;
        player = "X";
        running = true;
        statusEl.textContent = `Now "${player}" Turn`;
        statusEl.style.color = "black"
        restartBtnEl.textContent = "Restart 🔁"

        boxEls.forEach(box => {
          box.innerHTML = "";
          box.classList.remove('win');
        });
      }

      function checkWinner() {
        let isWon = false;
        for (let i = 0; i < win.length; i++) {
          const condition = win[i];
          const box1 = options[condition[0]];
          const box2 = options[condition[1]];
          const box3 = options[condition[2]];
          if (box1 == "" || box2 == "" || box3 == "") {
            continue;
          }
          if (box1 == box2 && box2 == box3) {
            isWon = true;
            boxEls[condition[0]].classList.add('win');
            boxEls[condition[1]].classList.add('win');
            boxEls[condition[2]].classList.add('win');
          }
        }

        if (isWon) {
          statusEl.textContent = `Hurrah...! "${player}" Won the game🕺`;
          statusEl.style.color = "green"
          restartBtnEl.textContent = "Play Again 😉"
          running = false;
        } else if (!options.includes("")) {
          statusEl.textContent = `Oops..! Game Draw..!`;
          statusEl.style.color = "red"
          restartBtnEl.textContent = "Play Again 😉"
          running = false;
        } else {
          changePlayer();
        }
      }
    };

    ticTacToeGame();
  }, []);

  return (
    <>
      <h1>Tik Tac Toe Game</h1>
      <div className="container">
        <div data-index="0" className="box"></div>
        <div data-index="1" className="box"></div>
        <div data-index="2" className="box"></div>
        <div data-index="3" className="box"></div>
        <div data-index="4" className="box"></div>
        <div data-index="5" className="box"></div>
        <div data-index="6" className="box"></div>
        <div data-index="7" className="box"></div>
        <div data-index="8" className="box"></div>
      </div>
      <div className="status"></div>
      <button className="restartBtn">Restart 🔁</button>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          border: none;
          font-family: "Poppins", sans-serif;
        }

        body {
          width: 100vw;
          height: 100vh;
          background-color: lightslategray;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        h1 {
          color: white;
          font-size: 32px;
          padding: 5px 50px;
          background-color: black;
          border-radius: 50px;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 3px;
          word-spacing: 3px;
        }

        .container {
          display: grid;
          grid-template-columns: repeat(3, auto);
          border: 2px solid black;
        }

        .box {
          width: 120px;
          height: 120px;
          border: 2px solid black;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          font-size: 25px;
        }

        .box img {
          width: 75px;
        }

        .status {
          margin: 20px 0;
          padding: 10px 40px;
          border-radius: 50px;
          font-size: 20px;
          font-weight: 500;
          background-color: white;
          color: black;
        }

        button {
          padding: 10px 20px;
          font-size: 20px;
          font-weight: 500;
          color: white;
          background-color: black;
          border-radius: 5px;
          cursor: pointer;
        }

        button:active {
          transform: scale(0.9);
        }

        .win {
          animation: winAnim ease-in-out 1s infinite;
        }

        @keyframes winAnim {
          0% {
            background-color: green;
          }
          100% {
            background-color: lightgreen;
          }
        }
      `}</style>
    </>
  );
};

export default TicTacToeGame;
