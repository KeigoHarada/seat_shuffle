import React from "react";
import type { TargetRect } from "./hooks/useTourOverlay";

interface TourBackdropProps {
  targetRect: TargetRect | null;
  hasActionFinished: boolean;
}

export const TourBackdrop: React.FC<TourBackdropProps> = ({
  targetRect,
  hasActionFinished,
}) => {
  if (!targetRect) return null;

  const hLeft = Math.max(0, targetRect.left - 6);
  const hTop = Math.max(0, targetRect.top - 6);
  const hRight = Math.min(
    window.innerWidth,
    targetRect.left + targetRect.width + 6,
  );
  const hBottom = Math.min(
    window.innerHeight,
    targetRect.top + targetRect.height + 6,
  );
  const hWidth = Math.max(0, hRight - hLeft);
  const hHeight = Math.max(0, hBottom - hTop);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "auto",
          zIndex: 1000,
          clipPath: `polygon(
            0% 0%, 0% 100%,
            ${hLeft}px 100%,
            ${hLeft}px ${hTop}px,
            ${hLeft + hWidth}px ${hTop}px,
            ${hLeft + hWidth}px ${hTop + hHeight}px,
            ${hLeft}px ${hTop + hHeight}px,
            ${hLeft}px 100%,
            100% 100%, 100% 0%
          )`,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
      <div
        style={{
          position: "fixed",
          top: `${hTop}px`,
          left: `${hLeft}px`,
          width: `${hWidth}px`,
          height: `${hHeight}px`,
          borderRadius: "var(--radius-lg)",
          border: hasActionFinished
            ? "3px solid #16a34a"
            : "2.5px solid var(--c-primary)",
          boxShadow: hasActionFinished
            ? "0 0 0 9999px rgba(15, 23, 42, 0.45), 0 0 24px rgba(22, 163, 74, 0.7)"
            : "0 0 0 9999px rgba(15, 23, 42, 0.45), 0 0 20px rgba(245, 158, 11, 0.6)",
          pointerEvents: "none",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxSizing: "border-box",
          zIndex: 1001,
          opacity: 1,
        }}
      />
    </>
  );
};
