
"use client"
import React, { useEffect } from 'react';

const MinesweeperGame = () => {
  useEffect(() => {
    const minesweeperGame = () => {
      let board = [];
      let rows = 8;
      let columns = 8;

      let minesCount = 10;
      let minesLocation = [];

      let tilesClicked = 0;
      let flagEnabled = false;

      let gameOver = false;

      function setMines() {
        let minesLeft = minesCount;
        while (minesLeft > 0) {
          let r = Math.floor(Math.random() * rows);
          let c = Math.floor(Math.random() * columns);
          let id = r.toString() + "-" + c.toString();

          if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
          }
        }
      }

      function startGame() {
        document.getElementById("mines-count").innerText = minesCount;
        document.getElementById("flag-button").addEventListener("click", setFlag);
        setMines();

        for (let r = 0; r < rows; r++) {
          let row = [];
          for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
          }
          board.push(row);
        }
      }

      function setFlag() {
        if (flagEnabled) {
          flagEnabled = false;
          document.getElementById("flag-button").style.backgroundColor = "lightgray";
        } else {
          flagEnabled = true;
          document.getElementById("flag-button").style.backgroundColor = "darkgray";
        }
      }

      function clickTile() {
        if (gameOver || this.classList.contains("tile-clicked")) {
          return;
        }

        let tile = this;
        if (flagEnabled) {
          if (tile.innerText == "") {
            tile.innerText = "🚩";
          } else if (tile.innerText == "🚩") {
            tile.innerText = "";
          }
          return;
        }

        if (minesLocation.includes(tile.id)) {
          gameOver = true;
          revealMines();
          return;
        }

        let coords = tile.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        checkMine(r, c);
      }

      function revealMines() {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
              tile.innerText = "💣";
              tile.style.backgroundColor = "red";
            }
          }
        }
      }

      function checkMine(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= columns) {
          return;
        }
        if (board[r][c].classList.contains("tile-clicked")) {
          return;
        }

        board[r][c].classList.add("tile-clicked");
        tilesClicked += 1;

        let minesFound = 0;

        minesFound += checkTile(r - 1, c - 1);
        minesFound += checkTile(r - 1, c);
        minesFound += checkTile(r - 1, c + 1);
        minesFound += checkTile(r, c - 1);
        minesFound += checkTile(r, c + 1);
        minesFound += checkTile(r + 1, c - 1);
        minesFound += checkTile(r + 1, c);
        minesFound += checkTile(r + 1, c + 1);

        if (minesFound > 0) {
          board[r][c].innerText = minesFound;
          board[r][c].classList.add("x" + minesFound.toString());
        } else {
          board[r][c].innerText = "";
          checkMine(r - 1, c - 1);
          checkMine(r - 1, c);
          checkMine(r - 1, c + 1);
          checkMine(r, c - 1);
          checkMine(r, c + 1);
          checkMine(r + 1, c - 1);
          checkMine(r + 1, c);
          checkMine(r + 1, c + 1);
        }

        if (tilesClicked == rows * columns - minesCount) {
          document.getElementById("mines-count").innerText = "Cleared";
          gameOver = true;
        }
      }

      function checkTile(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= columns) {
          return 0;
        }
        if (minesLocation.includes(r.toString() + "-" + c.toString())) {
          return 1;
        }
        return 0;
      }

      startGame();
    };

    minesweeperGame();
  }, []);

  return (
    <>
      <h1>Mines: <span id="mines-count">0</span></h1>
      <div id="board"></div>
      <br />
      <button id="flag-button">🚩</button>
      <style jsx>{`
        body {
          font-family: Arial, Helvetica, sans-serif;
          font-weight: bold;
          text-align: center;
        }
        #board {
          width: 400px;
          height: 400px;
          border: 10px solid darkgray;
          background-color: lightgray;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
        }
        #board div {
          width: 48px;
          height: 48px;
          border: 1px solid whitesmoke;
          font-size: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .tile-clicked {
          background-color: darkgrey;
        }
        .x1 { color: blue; }
        .x2 { color: green; }
        .x3 { color: red; }
        .x4 { color: navy; }
        .x5 { color: brown; }
        .x6 { color: teal; }
        .x7 { color: black; }
        .x8 { color: gray; }
        #flag-button {
          width: 100px;
          height: 50px;
          font-size: 30px;
          background-color: lightgray;
          border: none;
        }
      `}</style>
    </>
  );
};

export default MinesweeperGame;
