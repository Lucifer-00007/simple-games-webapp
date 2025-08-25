
"use client"
import React, { useEffect } from 'react';

const ConnectFourGame = () => {
  useEffect(() => {
    const connectFourGame = () => {
      var buttons = document.getElementsByClassName("btn");
      var reset = document.getElementById("reset-btn");
      var playerType = document.getElementById("player-type");

      var playerNumber = 1;
      var filledGrid = [];
      var filledCells = 0;

      for (var i = 0; i < 6; i++) {
        var arr = [-1, -1, -1, -1, -1, -1, -1];
        filledGrid.push(arr);
      }

      reset.addEventListener("click", function () {
        resetBoard();
      });

      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function () {
          var buttonNo = this.classList[1];
          makeMove(this, buttonNo.slice(4));
        });
      }

      function makeMove(button, buttonNo) {
        var row = buttonNo % 7 === 0 ? Math.floor(buttonNo / 7) - 1 : Math.floor(buttonNo / 7);
        var col = buttonNo % 7 === 0 ? 6 : (buttonNo % 7) - 1;

        if (playerNumber === 1) {
          button.classList.add("btn-player-1");
          filledGrid[row][col] = 1;
          filledCells++;

          if (playerWon(row, col, 1) === true) {
            setTimeout(function () {
              alert("Game Over: Green Wins");
              resetBoard();
            }, 200);
          }
          playerNumber = 2;
          playerType.textContent = "Player - 2";
        } else {
          button.classList.add("btn-player-2");
          filledGrid[row][col] = 2;
          filledCells++;

          if (playerWon(row, col, 2) === true) {
            setTimeout(function () {
              alert("Game Over : Red Wins");
              resetBoard();
            }, 200);
          }
          playerNumber = 1;
          playerType.textContent = "Player - 1";
        }

        if (filledCells === 42) {
          setTimeout(function () {
            alert("Game Draw");
            resetBoard();
          }, 200);
          return;
        }

        setTimeout(function () {
          button.disabled = true;
        }, 10);
      }

      function playerWon(row, col, player) {
        var count = 0;
        for (var i = 0; i < 7; i++) {
          if (filledGrid[row][i] === player) {
            count++;
            if (count === 4) return true;
          } else {
            count = 0;
          }
        }

        count = 0;
        for (var i = 0; i < 6; i++) {
          if (filledGrid[i][col] === player) {
            count++;
            if (count === 4) return true;
          } else {
            count = 0;
          }
        }

        count = 0;
        if (row >= col) {
          var i = row - col;
          var j = 0;
          for (; i <= 5; i++, j++) {
            if (filledGrid[i][j] === player) {
              count++;
              if (count == 4) return true;
            } else {
              count = 0;
            }
          }
        } else {
          var i = 0;
          var j = col - row;
          for (; j <= 6; i++, j++) {
            if (filledGrid[i][j] === player) {
              count++;
              if (count == 4) return true;
            } else {
              count = 0;
            }
          }
        }

        count = 0;
        if (row + col <= 5) {
          var i = row + col;
          var j = 0;
          for (; i >= 0 && j <= row + col; i--, j++) {
            if (filledGrid[i][j] === player) {
              count++;
              if (count == 4) return true;
            } else {
              count = 0;
            }
          }
        } else {
          var i = 5;
          var j = row + col - 5;
          for (; j <= 6; j++, i--) {
            if (filledGrid[i][j] === player) {
              count++;
              if (count == 4) return true;
            } else {
              count = 0;
            }
          }
        }
        return false;
      }

      function resetBoard() {
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].disabled = false;
          buttons[i].classList.remove("btn-player-1");
          buttons[i].classList.remove("btn-player-2");
        }
        playerNumber = 1;
        playerType.textContent = "Player - 1";
        filledCells = 0;
        for (var i = 0; i < 6; i++) {
          for (var j = 0; j < 7; j++) {
            filledGrid[i][j] = -1;
          }
        }
      }
    };

    connectFourGame();
  }, []);

  return (
    <>
      <div id="main-container">
        <div id="player">
          <h1 id="player-type">Player - 1</h1>
        </div>
        <div id="grid">
          {[...Array(6)].map((_, rowIndex) => (
            <div className="row" key={rowIndex}>
              {[...Array(7)].map((_, colIndex) => {
                const buttonNumber = rowIndex * 7 + colIndex + 1;
                return (
                  <div className="col" key={colIndex}>
                    <button className={`btn btn-${buttonNumber}`}></button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <button type="button" id="reset-btn">Play Again</button>
      </div>
      <style jsx>{`
        body {
          background-color: #e9e7fd;
        }
        #main-container {
          align-items: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 100vh;
        }
        #player {
          background-color: #d5deff;
          border: 8px solid #4f3ff0;
          border-radius: 10px;
          margin-top: 50px;
          padding: 20px;
          width: 550px;
        }
        #player-type {
          color: #4f3ff0;
          font-family: "Poppins";
          letter-spacing: 5px;
          text-align: center;
          text-transform: uppercase;
        }
        #grid {
          background-color: #4f3ff0;
          border: 3.5px solid #d5deff;
          border-radius: 8px;
          box-shadow: 2px 3px 7px grey;
          margin-top: 50px;
          max-width: 600px;
          padding: 3px;
        }
        .row {
          display: flex;
        }
        .col {
          align-items: center;
          background-color: #d5deff;
          border: 1px solid #4f3ff0;
          border-radius: 5px;
          display: flex;
          justify-content: center;
          height: 75px;
          margin: 5px;
          width: 75px;
        }
        .btn {
          background-color: transparent;
          border: none;
          color: transparent;
          height: 100%;
          padding: 0;
          width: 100%;
        }
        #reset-btn {
          background-color: transparent;
          border: 2px solid #4f3ff0;
          border-radius: 5px;
          color: #4f3ff0;
          font-family: "Poppins";
          font-size: 1.5rem;
          margin: 50px 0;
          padding: 10px 40px;
          text-transform: uppercase;
          transition: 0.7s;
        }
        #reset-btn:hover {
          background-color: #4f3ff0;
          color: #d5deff;
          cursor: pointer;
          transition: 0.7s;
        }
        .btn-player-1 {
          background-color: #34c471;
          border: 2px solid #34c471;
          border-radius: 50%;
          color: red;
          height: 50px;
          width: 50px;
        }
        .btn-player-2 {
          background-color: #df3670;
          border: 2px solid #df3670;
          border-radius: 50%;
          color: red;
          height: 50px;
          width: 50px;
        }
        @media (max-width: 800px) {
          #grid {
            width: 500px;
          }
          .col {
            height: 62px;
            margin: 4px;
            width: 62px;
          }
          #player {
            width: 450px;
          }
          #reset-btn {
            font-size: 1.2rem;
          }
          .btn-player-1 {
            height: 40px;
            width: 40px;
          }
          .btn-player-2 {
            height: 40px;
            width: 40px;
          }
        }
        @media (max-width: 550px) {
          #grid {
            width: 400px;
          }
          .col {
            height: 50px;
            margin: 3px;
            width: 50px;
          }
          #player {
            width: 350px;
          }
          #reset-btn {
            font-size: 1rem;
          }
          .btn-player-1 {
            height: 30px;
            width: 30px;
          }
          .btn-player-2 {
            height: 30px;
            width: 30px;
          }
        }
        @media (max-width: 450px) {
          #grid {
            width: 90%;
          }
          .col {
            height: 40px;
            margin: 2px;
          }
          #player {
            align-items: center;
            display: flex;
            border-width: 5px;
            justify-content: center;
            height: 30px;
            width: 78%;
          }
          #player-type {
            font-size: 1.2rem;
          }
          #reset-btn {
            font-size: 0.8rem;
          }
          .btn-player-1 {
            height: 20px;
            width: 20px;
          }
          .btn-player-2 {
            height: 20px;
            width: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default ConnectFourGame;
