import React from "react";

export const SlideAnimation: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "40px",
        background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
        animation: "slide 1s linear infinite",
        backgroundSize: "200% 100%",
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
          @keyframes slide {
            0% { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default SlideAnimation;
