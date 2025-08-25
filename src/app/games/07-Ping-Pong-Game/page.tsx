
"use client"
import React, { useEffect } from 'react';
import Head from 'next/head';

const PingPongGame = () => {
  useEffect(() => {
    const scriptJquery = document.createElement('script');
    scriptJquery.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    document.body.appendChild(scriptJquery);

    const scriptBootstrap = document.createElement('script');
    scriptBootstrap.src = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js';
    document.body.appendChild(scriptBootstrap);

    const gameScript = document.createElement('script');
    gameScript.innerHTML = `
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");

      var startBtn = document.getElementById("start-btn");
      var pauseBtn = document.getElementById("pause-btn");
      var restartBtn = document.getElementById("restart-btn");
      var animationId;
      var gameRunning = false;

      startBtn.addEventListener("click", function () {
        if (!gameRunning) {
          gameRunning = true;
          loop();
        }
      });

      pauseBtn.addEventListener("click", function () {
        gameRunning = false;
        cancelAnimationFrame(animationId);
      });

      restartBtn.addEventListener("click", function () {
        document.location.reload();
      });

      addEventListener("load", (event) => {
        draw();
      });

      var ballRadius = 10;
      var ballX = canvas.width / 2;
      var ballY = canvas.height / 2;
      var ballSpeedX = 5;
      var ballSpeedY = 5;

      var paddleHeight = 80;
      var paddleWidth = 10;
      var leftPaddleY = canvas.height / 2 - paddleHeight / 2;
      var rightPaddleY = canvas.height / 2 - paddleHeight / 2;
      var paddleSpeed = 10;

      var leftPlayerScore = 0;
      var rightPlayerScore = 0;
      var maxScore = 10;

      document.addEventListener("keydown", keyDownHandler);
      document.addEventListener("keyup", keyUpHandler);

      var upPressed = false;
      var downPressed = false;
      let wPressed = false;
      let sPressed = false;

      function keyDownHandler(e) {
        if (e.key === "ArrowUp") {
          upPressed = true;
        } else if (e.key === "ArrowDown") {
          downPressed = true;
        } else if (e.key === "w") {
          wPressed = true;
        } else if (e.key === "s") {
          sPressed = true;
        }
      }

      function keyUpHandler(e) {
        if (e.key === "ArrowUp") {
          upPressed = false;
        } else if (e.key === "ArrowDown") {
          downPressed = false;
        } else if (e.key === "w") {
          wPressed = false;
        } else if (e.key === "s") {
          sPressed = false;
        }
      }

      function update() {
        if (upPressed && rightPaddleY > 0) {
          rightPaddleY -= paddleSpeed;
        } else if (downPressed && rightPaddleY + paddleHeight < canvas.height) {
          rightPaddleY += paddleSpeed;
        }

        if (wPressed && leftPaddleY > 0) {
          leftPaddleY -= paddleSpeed;
        } else if (sPressed && leftPaddleY + paddleHeight < canvas.height) {
          leftPaddleY += paddleSpeed;
        }

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
          ballSpeedY = -ballSpeedY;
        }

        if (
          ballX - ballRadius < paddleWidth &&
          ballY > leftPaddleY &&
          ballY < leftPaddleY + paddleHeight
        ) {
          ballSpeedX = -ballSpeedX;
        }

        if (
          ballX + ballRadius > canvas.width - paddleWidth &&
          ballY > rightPaddleY &&
          ballY < rightPaddleY + paddleHeight
        ) {
          ballSpeedX = -ballSpeedX;
        }

        if (ballX < 0) {
          rightPlayerScore++;
          reset();
        } else if (ballX > canvas.width) {
          leftPlayerScore++;
          reset();
        }

        if (leftPlayerScore === maxScore) {
          playerWin("Left player");
        } else if (rightPlayerScore === maxScore) {
          playerWin("Right player");
        }
      }

      function playerWin(player) {
        var message = "Congratulations! " + player + " win!";
        $("#message").text(message);
        $("#message-modal").modal("show");
        reset();
      }

      function reset() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
        ballSpeedY = Math.random() * 10 - 5;
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFF";
        ctx.font = "15px Arial";
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
        ctx.fillRect(
          canvas.width - paddleWidth,
          rightPaddleY,
          paddleWidth,
          paddleHeight
        );
        ctx.fillText("Score: " + leftPlayerScore, 10, 20);
        ctx.fillText("Score: " + rightPlayerScore, canvas.width - 70, 20);
      }

      function loop() {
        update();
        draw();
        animationId = requestAnimationFrame(loop);
      }

      $("#message-modal-close").on("click", function () {
        document.location.reload();
      });
    `;
    document.body.appendChild(gameScript);

    return () => {
      document.body.removeChild(scriptJquery);
      document.body.removeChild(scriptBootstrap);
      document.body.removeChild(gameScript);
    };
  }, []);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
        />
      </Head>
      <div className="container">
        <canvas id="canvas" width="600" height="400"></canvas>
      </div>
      <div className="button">
        <button id="start-btn" className="btn">Start</button>
        <button id="pause-btn" className="btn">Pause</button>
        <button id="restart-btn" className="btn">Restart</button>
      </div>
      <p className="control">Control: Player Left(W and S) | Player Right(↑ and ↓)</p>
      <div className="modal" tabIndex="-1" role="dialog" id="message-modal">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-body">
              <h5 id="message"></h5>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                id="message-modal-close"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .button {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        .btn {
          background-color: #4caf50;
          border: none;
          color: white;
          padding: 10px 20px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 10px;
          cursor: pointer;
          border-radius: 5px;
        }
        .btn:hover {
          background-color: #3e8e41;
        }
        .control {
          text-align: center;
        }
        canvas {
          background: #000;
          border: 1px solid black;
        }
      `}</style>
    </>
  );
};

export default PingPongGame;
