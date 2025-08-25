
"use client"
import React, { useEffect } from 'react';

const FruitSlicerGame = () => {
  useEffect(() => {
    const scriptJquery = document.createElement('script');
    scriptJquery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
    document.body.appendChild(scriptJquery);

    const scriptJqueryUI = document.createElement('script');
    scriptJqueryUI.src = 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js';
    document.body.appendChild(scriptJqueryUI);

    const gameScript = document.createElement('script');
    gameScript.innerHTML = `
      var playing = false;
      var score;
      var trialsleft;
      var step;
      var action;
      var fruits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

      $(function () {
        $("#front").show();
        $("#startReset").click(function () {
          if (playing == true) {
            location.reload();
          } else {
            $("#front").hide();
            $("#score").show();
            playing = true;
            score = 0;
            $("#scoreValue").html(score);
            $("#trialsleft").show();
            trialsleft = 3;
            addhearts();
            $("#gameOver").hide();
            $("#startReset").html("Reset Game");
            startAction();
          }
        });
        $("#fruit1").mouseover(function () {
          score++;
          $("#scoreValue").html(score);
          $("#slicesound")[0].play();
          clearInterval(action);
          $("#fruit1").hide("explode", 500);
          setTimeout(startAction, 500);
        });

        function addhearts() {
          $("#trialsleft").empty();
          for (i = 0; i < trialsleft; i++) {
            $("#trialsleft").append(
              '<img src="https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/wrong.png" , class="life">'
            );
          }
        }

        function startAction() {
          $("#fruit1").show();
          chooseRandom();
          $("#fruit1").css({
            left: Math.round(550 * Math.random()),
            top: -50,
          });
          step = 1 + Math.round(5 * Math.random());
          action = setInterval(function () {
            $("#fruit1").css("top", $("#fruit1").position().top + step);
            if ($("#fruit1").position().top > $("#fruitcontainer").height() - 50) {
              if (trialsleft > 1) {
                $("#fruit1").show();
                chooseRandom();
                $("#fruit1").css({
                  left: Math.round(550 * Math.random()),
                  top: -50,
                });
                step = 1 + Math.round(5 * Math.random());
                trialsleft--;
                addhearts();
              } else {
                playing = false;
                $("#score").hide();
                $("#startreset").html("Start Game");
                $("#gameOver").show();
                $("#gameOver").html(
                  "<p>Game Over!</p><p>Your score is " + score + "</p>"
                );
                $("#trialsleft").hide();
                stopAction();
              }
            }
          }, 10);
        }

        function chooseRandom() {
          $("#fruit1").attr(
            "src",
            "https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/" +
              fruits[Math.round(9 * Math.random())] +
              ".png"
          );
        }
        function stopAction() {
          clearInterval(action);
          $("#fruit1").hide();
        }
      });
    `;
    document.body.appendChild(gameScript);

    return () => {
      document.body.removeChild(scriptJquery);
      document.body.removeChild(scriptJqueryUI);
      document.body.removeChild(gameScript);
    };
  }, []);

  return (
    <>
      <div id="container">
        <div id="instructions">
          Slice Fruits
        </div>
        <div id="fruitcontainer">
          <div id="score">
            <div className="scoreDisplay">
              <img
                src="https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/scr.png"
                alt=""
              />
              <span id="scoreValue">0</span>
            </div>
          </div>
          <div id="trialsleft"></div>
          <div id="front">
            Are you ready for the ultimate slice action ? <br />
            <img
              src="https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/splash.png"
              alt="Fruit logo"
            />
          </div>
          <img id="fruit1" className="fruit" />
        </div>
        <div id="startReset">
          Start Game
        </div>
        <div id="gameOver"></div>
      </div>
      <audio id="slicesound">
        <source
          src="https://github.com/Saumya-07/Fruit-Slicer/blob/master/audio/slicefruit.mp3"
        />
        <source
          src="https://github.com/Saumya-07/Fruit-Slicer/blob/master/audio/slicefruit.ogg"
        />
        <source
          src="https://github.com/Saumya-07/Fruit-Slicer/blob/master/audio/slicefruit.wav"
        />
      </audio>
      <style jsx>{`
        html {
          height: 100%;
          background: radial-gradient(circle, #fff, rgb(189, 182, 182));
          background-image: url(https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/wood-bg2.jpg);
          background-size: cover;
          font-family: cursive, sans-serif;
        }
        #container {
          width: 750px;
          height: 600px;
          margin: 10px auto;
          padding: 20px;
          border-radius: 10px;
          position: relative;
        }

        #front {
          font-size: 40px;
          color: #d3901d;
          width: 650px;
          height: 450px;
          padding: 10px;
          margin: 30px auto 20px auto;
          z-index: 2;
          display: none;
        }
        #front img {
          width: 280px;
        }
        #instructions {
          width: 450px;
          height: 50px;
          margin: 10px auto;
          font-size: 30px;

          background-color: #d3901d;
          color: #2e1d11;
          text-align: center;
          line-height: 50px;
          border-radius: 20px;
          box-shadow: 0px 4px 0px 0px #775012;
        }
        #fruitcontainer {
          background: url(https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/wood-bg2.jpg);
          background-size: cover;
          width: 650px;
          height: 450px;
          padding: 10px;
          margin: 30px auto 20px auto;
          background-color: white;
          color: black;
          text-align: center;
          font-family: cursive, sans-serif;
          overflow: hidden;
          border-radius: 20px;
          box-shadow: 0px 4px 0px 0px #4b4b4e;
          position: relative;
        }

        .fruit {
          display: none;
          position: absolute;
        }
        #score {
          display: none;
        }
        .scoreDisplay {
          z-index: 1;
          display: flex;
          background-color: transparent;
          color: #888e61;
          position: absolute;
          font-size: 30px;
          justify-items: center;
        }

        #score img {
          width: 40px;
          align-items: center;
          padding-right: 5px;
        }
        #trialsleft {
          margin-top: 7px;
          display: flex;
          position: absolute;
          left: 550px;
          background-color: transparent;
          z-index: 1;
        }
        .life {
          width: 30px;
          padding-right: 5px;
        }

        #startReset {
          position: relative;
          width: 90px;
          padding: 10px;
          margin: 0 auto;

          cursor: pointer;
          text-align: center;
          background-color: #8d8315;
          box-shadow: 0px 4px 0px 0px #5c5619;
          border-radius: 5px;
          transition: all 0.2s;
        }
        #startReset:active {
          background-color: #69620c;
          box-shadow: 0px 0px #5c5619;
          top: 4px;
          color: white;
        }

        #gameOver {
          box-sizing: border-box;
          width: 500px;
          height: 300px;
          background: transparent;
          color: #d3901d;
          text-transform: upperCase;
          text-align: center;
          font-size: 3em;
          position: absolute;
          top: 170px;
          left: 150px;
          z-index: 2;
        }
      `}</style>
    </>
  );
};

export default FruitSlicerGame;
