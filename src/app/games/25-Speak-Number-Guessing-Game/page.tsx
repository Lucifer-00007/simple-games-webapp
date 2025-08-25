
"use client"
import React, { useEffect } from 'react';

const SpeakNumberGuessingGame = () => {
  useEffect(() => {
    const speakNumberGuessingGame = () => {
      const messageElement = document.getElementById("msg");

      const randomNumber = getRandomNumber();

      // Check for browser compatibility
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        messageElement.innerHTML = "<div>Your browser does not support Speech Recognition. Please try Chrome.</div>";
        return;
      }

      let recognition = new SpeechRecognition();
      recognition.start();

      function getRandomNumber() {
        return Math.floor(Math.random() * 100) + 1;
      }

      function onSpeak(event: SpeechRecognitionEvent) {
        const message = event.results[0][0].transcript;
        writeMessage(message);
        checkNumber(message);
      }

      function writeMessage(message: string) {
        messageElement.innerHTML = `
          <div>You said: </div>
          <span class="box">${message}</span>
        `;
      }

      function checkNumber(message: string) {
        const number = +message;
        if (Number.isNaN(number)) {
          messageElement.innerHTML += "<div>That is not a valid number</div>";
          return;
        }
        if (number > 100 || number < 1) {
          messageElement.innerHTML += "<div>Number must be between 1 and 100</div>";
          return;
        }
        if (number === randomNumber) {
          document.body.innerHTML = `
                <h2>Congrats! You have guessed the number! <br><br>
                It was ${number}</h2>
                <button class="play-again" id="play-again">Play Again</button>
              `;
        } else if (number > randomNumber) {
          messageElement.innerHTML += "<div>GO LOWER</div>";
        } else {
          messageElement.innerHTML += "<div>GO HIGHER</div>";
        }
      }

      recognition.addEventListener("result", onSpeak);
      recognition.addEventListener("end", () => recognition.start());

      document.body.addEventListener("click", (e) => {
        if ((e.target as HTMLElement).id == "play-again") history.go(0);
      });
    };

    speakNumberGuessingGame();
  }, []);

  return (
    <>
      <img
        src="https://i.ibb.co/Kb6SkTm/8399350-mic-microphone-audio-icon.png"
        alt="Speak"
      />
      <h1>Guess a Number Between 1 - 100</h1>
      <h2>Speak the number into your microphone</h2>
      <div id="msg" className="msg"></div>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Recursive:wght@400;700&display=swap");

        * {
          box-sizing: border-box;
        }

        body {
          background: #27273d
            url("https://images.unsplash.com/photo-1552749412-091909ed9f82?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")
            no-repeat center center/cover;
          color: rgba(255, 255, 255, 0.87);
          font-family: "Recursive", sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100vh;
          overflow: hidden;
          margin: 0;
        }

        body::after {
          content: "";
          background-color: rgba(0, 0, 0, 0.7);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        body * {
          z-index: 1;
        }

        img {
          width: 8rem;
          height: 8rem;
        }

        h1,
        h2 {
          margin-bottom: 0;
        }

        h2 {
          font-size: 1.17rem;
        }

        p {
          line-height: 1.5;
          margin: 0;
        }

        .play-again {
          cursor: pointer;
          padding: 0.5rem 1rem;
          border: 0;
          background-color: #f4f4f4;
          border-radius: 5px;
          margin-top: 2rem;
        }

        .play-again:hover {
          background-color: #27273d;
          color: #f4f4f4;
        }

        .play-again:focus {
          outline: none;
        }

        .msg {
          font-size: 1.5rem;
          margin-top: 2.5rem;
        }

        .box {
          border: 1px solid #dedede;
          display: inline-block;
          font-size: 1.875rem;
          margin: 1.25rem;
          padding: 0.625rem;
        }
      `}</style>
    </>
  );
};

export default SpeakNumberGuessingGame;
