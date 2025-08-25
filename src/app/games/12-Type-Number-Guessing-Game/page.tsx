
"use client"
import React, { useEffect } from 'react';

const TypeNumberGuessingGame = () => {
  useEffect(() => {
    const typeNumberGuessingGame = () => {
      const inputEl = document.querySelector("input");
      const guessEl = document.querySelector(".guess");
      const checkBtnEl = document.querySelector("button");
      const remainingChancesTextEl = document.querySelector(".chances");
      const remainingChancesEl = document.querySelector(".chance");

      let randomNumber = Math.floor(Math.random() * 100);

      let totalChances = 10;

      checkBtnEl.addEventListener("click", () => {
        totalChances--;
        let inputValue = inputEl.value;

        if (totalChances === 0) {
          inputValue = "";
          inputEl.disabled = true;
          guessEl.textContent = "Oops...! Bad luck😥, You lost the game."
          guessEl.style.color = "red";
          checkBtnEl.textContent = "Play Again...😉";
          remainingChancesTextEl.textContent = "No chances left"
        }
        else if (totalChances < 0) {
          window.location.reload();
        }
        else if (inputValue == randomNumber) {
          inputEl.disabled = true;
          guessEl.textContent = "Hurrah...! Congratulations😍, You won the game."
          guessEl.style.color = "green";
          checkBtnEl.textContent = "Play Again...😉";
          totalChances = 0;
        } else if (inputValue > randomNumber && inputValue < 100) {
          guessEl.textContent = "Your Guess is High👍.";
          remainingChancesEl.textContent = totalChances;
          guessEl.style.color = "#1446a0";
        } else if (inputValue < randomNumber && inputValue > 0) {
          guessEl.textContent = "Your Guess is low👎.";
          remainingChancesEl.textContent = totalChances;
          guessEl.style.color = "#1446a0";
        } else {
          guessEl.textContent = "Your number is invalid.";
          remainingChancesEl.textContent = totalChances;
          guessEl.style.color = "red";
        }
      });
    };

    typeNumberGuessingGame();
  }, []);

  return (
    <>
      <h1>Number Guessing Game</h1>
      <div className="container">
        <h2 className="heading">Guess a number between 1 to 100</h2>
        <input type="number" placeholder="Guess a number" />
        <p className="guess"></p>
        <button className="checkBtn">Check</button>
        <p className="chances">You have only <span className="chance">10</span> chances</p>
      </div>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        body {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 100vh;
          background: #db3069;
        }

        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          padding: 10px 50px;
          color: #1446a0;
          background-color: white;
          border-radius: 50px;
        }

        .container {
          text-align: center;
          padding: 25px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        }
        .container h2 {
          font-size: 20px;
          color: #1446a0;
          font-weight: 500;
        }

        .container .guess {
          color: #1446a0;
          font-size: 18px;
          margin: 10px 0;
        }

        .container .chances {
          color: black;
          font-size: 16px;
          margin-top: 5px;
        }

        .container input {
          font-size: 20px;
          padding: 0 20px;
          text-align: center;
          width: 100%;
          height: 50px;
          margin: 10px 0;
          border: 3px solid #1446a0;
          border-radius: 5px;
        }

        input:disabled {
          cursor: not-allowed;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        .checkBtn {
          font-size: 18px;
          margin: 10px 0;
          padding: 10px 40px;
          color: white;
          background: #1446a0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .checkBtn:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
};

export default TypeNumberGuessingGame;
