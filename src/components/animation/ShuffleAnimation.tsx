import React from "react";
import { useStore } from "../../stores/appStore";
import { useUiStore } from "../../stores/uiStore";
import ConfettiAnimation from "./ConfettiAnimation";
import SlideAnimation from "./SlideAnimation";
import FlashAnimation from "./FlashAnimation";

interface ShuffleAnimationProps {
  forceShow?: boolean;
}

const ShuffleAnimation: React.FC<ShuffleAnimationProps> = ({ forceShow }) => {
  const isShuffling = useUiStore((state) => state.isShuffling);
  const animationType = useStore(
    (state) => state.appSettings.shuffleAnimation || "none",
  );

  if ((!isShuffling && !forceShow) || animationType === "none") return null;

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

export default ShuffleAnimation;
