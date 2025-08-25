
"use client"
import React, { useEffect } from 'react';

const RockPaperScissorsGame = () => {
  useEffect(() => {
    const rockPaperScissorsGame = () => {
      const imgEls = document.querySelectorAll("img");
      const resultEl = document.querySelector(".result");
      const userChoiceEl = document.querySelector(".user-choice");
      const computerChoiceEl = document.querySelector(".computer-choice");
      const userPointsEl = document.querySelector(".user-points");
      const computerPointsEl = document.querySelector(".computer-points");

      let userPoints = 0;
      let computerPoints = 0;

      imgEls.forEach((img) => {
        img.addEventListener("click", () => {
          const computerTurn = computerChoice();
          const result = gamePlay(img.id, computerTurn);
          userChoiceEl.textContent = img.id;
          computerChoiceEl.textContent = computerTurn;
          resultEl.textContent = result;
        });
      });

      function computerChoice() {
        const choices = ["rock", "paper", "scissor"];
        const randomChoice = Math.floor(Math.random() * choices.length);
        return choices[randomChoice];
      }

      function gamePlay(userSelection, computerSelection) {
        if (userSelection === computerSelection) {
          return "It is a tie..!";
        } else if (
          (userSelection === "rock" && computerSelection === "scissor") ||
          (userSelection === "paper" && computerSelection === "rock") ||
          (userSelection === "scissor" && computerSelection === "paper")
        ) {
          userPoints++;
          userPointsEl.textContent = userPoints;
          return "Hurrah! You win..! " + userSelection + " beats " + computerSelection;
        } else {
          computerPoints++;
          computerPointsEl.textContent = computerPoints;
          return "Oops! You lose...! " + computerSelection + " beats " + userSelection;
        }
      }
    };

    rockPaperScissorsGame();
  }, []);

  return (
    <>
      <div className="container">
        <h1>Rock, Paper & Scissor Game</h1>
        <h2>Pick your choice</h2>
        <div className="choices">
          <img src="/games/11-Rock-Paper-Scissors/images/rock.jpg" alt="rock" id="rock" />
          <img src="/games/11-Rock-Paper-Scissors/images/paper.jpg" alt="paper" id="paper" />
          <img src="/games/11-Rock-Paper-Scissors/images/scissor.jpg" alt="scissor" id="scissor" />
        </div>
        <div className="both-choices">
          <h3>User Choice : <span className="user-choice">NA</span></h3>
          <h3>Computer Choice : <span className="computer-choice">NA</span></h3>
        </div>
        <p className="result">Results will appear here...</p>
        <div className="points">
          <h3>User Points : <span className="user-points">0</span></h3>
          <h3>Computer Points : <span className="computer-points">0</span></h3>
        </div>
      </div>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        body,
        .container,
        .choices,
        .both-choices,
        .points {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        body {
          background-color: black;
          color: white;
          height: 100vh;
        }

        .container {
          flex-direction: column;
          gap: 20px;
        }

        .choices {
          gap: 20px;
          width: 400px;
        }

        .choices img {
          width: 100px;
          height: 100px;
          cursor: pointer;
          border-radius: 50%;
        }

        .choices img:active {
          transform: scale(0.95);
        }

        .both-choices h3:nth-child(1) {
          margin-right: 20px;
        }

        .both-choices span {
          font-weight: 500;
          color: yellow;
        }

        .result {
          font-size: 28px;
          color: yellow;
        }

        .points h3:nth-child(1) {
          margin-right: 15px;
        }

        .points span {
          font-weight: 500;
          color: yellow;
        }
      `}</style>
    </>
  );
};

export default RockPaperScissorsGame;
