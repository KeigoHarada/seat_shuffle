import React from "react";
import { useStore } from "../../stores";

const ShuffleAnimation: React.FC = () => {
  const isShuffling = useStore((state) => state.isShuffling);
  const animationType = useStore(
    (state) => state.appSettings.shuffleAnimation || "none",
  );

  if (!isShuffling || animationType === "none") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        pointerEvents: "none",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {animationType === "confetti" && <ConfettiAnimation />}
      {animationType === "slide" && <SlideAnimation />}
      {animationType === "flash" && <FlashAnimation />}
    </div>
  );
};

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
      {/* 簡易的なCSSアニメーションの紙吹雪を生成 */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${Math.random() * 100}%`,
            top: "-20px",
            width: "10px",
            height: "20px",
            backgroundColor: [
              "#ff595e",
              "#ffca3a",
              "#8ac926",
              "#1982c4",
              "#6a4c93",
            ][Math.floor(Math.random() * 5)],
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

const SlideAnimation: React.FC = () => {
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

const FlashAnimation: React.FC = () => {
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

export default ShuffleAnimation;
