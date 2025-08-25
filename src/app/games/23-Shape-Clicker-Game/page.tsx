
"use client"
import React, { useEffect, useRef, useState } from 'react';

const ShapeClickerGame = () => {
  const outputRef = useRef(null);
  const [message, setMessage] = useState("Press To Start");
  const [boxStyle, setBoxStyle] = useState({});
  const game = useRef({ timer: 0, start: null });

  const randomNumbers = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  const addBox = () => {
    game.current.start = new Date().getTime();
    const container = outputRef.current?.getBoundingClientRect();
    if (!container) return;

    const dim = [randomNumbers(50) + 20, randomNumbers(50) + 20];
    setBoxStyle({
      display: "block",
      width: `${dim[0]}px`,
      height: `${dim[1]}px`,
      backgroundColor: "#" + Math.random().toString(16).substr(-6),
      left: randomNumbers(container.width - dim[0]) + "px",
      top: randomNumbers(container.height - dim[1]) + "px",
      borderRadius: randomNumbers(50) + "%",
    });
  };

  const handleBoxClick = () => {
    setBoxStyle(prev => ({ ...prev, display: "none" }));
    clearTimeout(game.current.timer);
    game.current.timer = setTimeout(() => addBox(), randomNumbers(3000));

    if (!game.current.start) {
      setMessage("Watch for element and click it");
    } else {
      const current = new Date().getTime();
      const duration = (current - game.current.start) / 1000;
      setMessage(`It took ${duration} seconds to click`);
    }
  };

  useEffect(() => {
    // Initial call to start the game loop
    game.current.timer = setTimeout(() => addBox(), randomNumbers(3000));

    return () => {
      clearTimeout(game.current.timer);
    };
  }, []);

  return (
    <>
      <div className="message">{message}</div>
      <div className="output" ref={outputRef}>
        <div className="box" style={boxStyle} onClick={handleBoxClick}></div>
      </div>
      <style jsx>{`
        body {
          background: black;
          color: white;
        }

        .message {
          text-align: center;
          padding: 10px;
          font-size: 2rem;
        }

        .output {
          position: relative;
          width: 100%;
          height: 80vh;
          border: 1px solid gray;
          overflow: hidden;
        }

        .box {
          position: absolute;
          top: 50px;
          left: 20%;
          background-color: cornsilk;
          border: 1px solid black;
          font-size: 1.5em;
          line-height: 100px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default ShapeClickerGame;
