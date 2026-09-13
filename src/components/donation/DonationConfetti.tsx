import React from "react";

const CONFETTI_COLORS = [
  "#ff595e", // coral red
  "#ffca3a", // warm yellow
  "#8ac926", // lime green
  "#1982c4", // sky blue
  "#6a4c93", // purple
  "#f43f5e", // rose
  "#fbbf24", // amber
];

interface DonationConfettiProps {
  count?: number;
}

export const DonationConfetti: React.FC<DonationConfettiProps> = ({
  count = 45,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 10000,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg) scale(1);
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(105vh) rotate(720deg) scale(0.6);
            opacity: 0;
          }
        }
      `}</style>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i / count) * 100 + (Math.sin(i) * 5);
        const animDuration = 2.5 + (i % 5) * 0.4;
        const animDelay = (i % 7) * 0.15;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const width = 8 + (i % 4) * 3;
        const height = 12 + (i % 3) * 4;
        const isCircle = i % 3 === 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "-25px",
              left: `${Math.max(2, Math.min(98, left))}%`,
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: color,
              borderRadius: isCircle ? "50%" : "2px",
              animation: `confettiFall ${animDuration}s cubic-bezier(0.25, 1, 0.5, 1) ${animDelay}s forwards`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        );
      })}
    </div>
  );
};

export default DonationConfetti;
