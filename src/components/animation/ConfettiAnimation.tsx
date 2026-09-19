import React from "react";

const CONFETTI_COLORS = [
  "#ff595e",
  "#ffca3a",
  "#8ac926",
  "#1982c4",
  "#6a4c93",
];

const ConfettiAnimation: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-20px",
            width: "10px",
            height: "20px",
            backgroundColor:
              CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            opacity: Math.random() * 0.5 + 0.5,
            animation: `fall ${Math.random() * 2 + 1}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

export default ConfettiAnimation;
