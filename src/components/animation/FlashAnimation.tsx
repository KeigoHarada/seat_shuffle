import React from "react";

export const FlashAnimation: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "40px",
        backgroundColor: "#f59e0b",
        animation: "flash 0.5s ease-in-out infinite alternate",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "20px",
        letterSpacing: "8px",
      }}
    >
      SHUFFLING...
      <style>
        {`
          @keyframes flash {
            0% { opacity: 0.2; transform: scaleY(1); }
            100% { opacity: 1; transform: scaleY(1.5); }
          }
        `}
      </style>
    </div>
  );
};

export default FlashAnimation;
