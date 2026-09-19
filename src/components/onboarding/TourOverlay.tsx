import React from "react";
import { useTourOverlay } from "./hooks/useTourOverlay";
import { TourBackdrop } from "./TourBackdrop";
import { TourTooltipCard } from "./TourTooltipCard";

export const TourOverlay: React.FC = () => {
  const {
    isTourActive,
    currentStep,
    currentTourStep,
    isFirstStep,
    isLastStep,
    targetRect,
    hasActionFinished,
    tooltipRef,
    tooltipStyle,
    handleMouseDown,
    nextTourStep,
    prevTourStep,
    skipTourStep,
    totalSteps,
  } = useTourOverlay();

  if (!isTourActive || !currentStep) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <TourBackdrop
        targetRect={targetRect}
        hasActionFinished={hasActionFinished}
      />
      <TourTooltipCard
        tooltipRef={tooltipRef}
        tooltipStyle={tooltipStyle}
        handleMouseDown={handleMouseDown}
        currentStep={currentStep}
        currentTourStep={currentTourStep}
        totalSteps={totalSteps}
        hasActionFinished={hasActionFinished}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        skipTourStep={skipTourStep}
        prevTourStep={prevTourStep}
        nextTourStep={nextTourStep}
      />
    </div>
  );
};

export default TourOverlay;
