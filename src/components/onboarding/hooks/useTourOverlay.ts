import { useState, useCallback, useRef, useEffect, type CSSProperties, type MouseEvent } from "react";
import { useOnboardingStore } from "../../../stores/onboarding";
import { useStore } from "../../../stores/appStore";
import { TOUR_STEPS } from "../tourSteps";
import type { TourStep } from "../../../types/onboarding";

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useTourOverlay() {
  const isTourActive = useOnboardingStore((state) => state.isTourActive);
  const currentTourStep = useOnboardingStore((state) => state.currentTourStep);
  const nextTourStep = useOnboardingStore((state) => state.nextTourStep);
  const skipTourStep = useOnboardingStore((state) => state.skipTourStep);
  const prevTourStep = useOnboardingStore((state) => state.prevTourStep);

  const activeSettingsTab = useStore((state) => state.activeSettingsTab);
  const seats = useStore((state) => state.seats);
  const students = useStore((state) => state.students);
  const groups = useStore((state) => state.groups);
  const constraints = useStore((state) => state.constraints);
  const isViewMode = useStore((state) => state.isViewMode);
  const isShuffling = useStore((state) => state.isShuffling);
  const undoStack = useStore((state) => state.undoStack);

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hasActionFinished, setHasActionFinished] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartElementPos = useRef({ x: 0, y: 0 });

  const currentStep: TourStep | undefined = TOUR_STEPS[currentTourStep];

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartElementPos.current = { ...position };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      setPosition({
        x: dragStartElementPos.current.x + dx,
        y: dragStartElementPos.current.y + dy,
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [currentTourStep]);

  const checkStepCompletion = useCallback((): boolean => {
    if (!currentStep) return false;
    const mainStore = useStore.getState();
    const onboardingStore = useOnboardingStore.getState();
    return currentStep.checkCondition(mainStore, onboardingStore);
  }, [
    currentStep,
    seats,
    students,
    groups,
    constraints,
    undoStack.length,
    isShuffling,
    isViewMode,
  ]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setHasActionFinished(false);
      return;
    }

    const isDone = checkStepCompletion();
    if (isDone && !hasActionFinished) {
      setHasActionFinished(true);
    } else if (!isDone) {
      setHasActionFinished(false);
    }
  }, [isTourActive, currentStep, checkStepCompletion, hasActionFinished]);

  const updateRect = useCallback(() => {
    if (!isTourActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    let targetSelector = currentStep.targetSelector;

    if (currentStep.id === "step-add-constraint") {
      if (activeSettingsTab !== "constraints") {
        targetSelector = "#tab-btn-constraints";
      } else if (!hasActionFinished) {
        targetSelector = "#constraint-add-form";
      } else {
        targetSelector = "#constraint-list-area";
      }
    } else if (hasActionFinished) {
      switch (currentStep.id) {
        case "step-template":
          targetSelector = "#canvas-main-area";
          break;
        case "step-add-student":
        case "step-sort-students":
          targetSelector = "#student-list-area";
          break;
        case "step-assign-groups":
        case "step-shuffle":
        case "step-viewmode":
          targetSelector = "#canvas-main-area";
          break;
      }
    }

    const el = document.querySelector(targetSelector);
    if (el) {
      if (targetSelector === "#btn-toolbar-template") {
        let minTop = Infinity,
          minLeft = Infinity,
          maxBottom = -Infinity,
          maxRight = -Infinity;
        const computeRect = (node: Element) => {
          const b = node.getBoundingClientRect();
          if (b.width > 0 && b.height > 0) {
            minTop = Math.min(minTop, b.top);
            minLeft = Math.min(minLeft, b.left);
            maxBottom = Math.max(maxBottom, b.bottom);
            maxRight = Math.max(maxRight, b.right);
          }
          for (let i = 0; i < node.children.length; i++) {
            computeRect(node.children[i]);
          }
        };
        computeRect(el);

        if (minTop !== Infinity) {
          setTargetRect({
            top: minTop,
            left: minLeft,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
          });
        } else {
          setTargetRect(null);
        }
      } else {
        const b = el.getBoundingClientRect();
        setTargetRect({
          top: b.top,
          left: b.left,
          width: b.width,
          height: b.height,
        });
      }
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStep, hasActionFinished, activeSettingsTab]);

  useEffect(() => {
    updateRect();
    const handleResizeOrScroll = () => {
      updateRect();
    };

    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    const observer = new MutationObserver(() => {
      updateRect();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    let animationFrameId: number;
    const startTime = Date.now();

    const pollRect = () => {
      updateRect();
      if (Date.now() - startTime < 500) {
        animationFrameId = requestAnimationFrame(pollRect);
      }
    };
    pollRect();

    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [updateRect]);

  const getTooltipStyle = (): CSSProperties => {
    const defaultStyle: CSSProperties = {
      position: "fixed",
      zIndex: 1002,
    };

    let baseTop = 0;
    let baseLeft = 0;

    if (!targetRect || !currentStep) {
      return {
        ...defaultStyle,
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
      };
    }

    const margin = 16;
    const tooltipWidth = Math.min(360, window.innerWidth - 32);
    const tooltipHeight = Math.min(240, window.innerHeight * 0.55);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let placement = currentStep.placement;
    if (currentStep.id === "step-shuffle" && !hasActionFinished) {
      placement = "top-right";
    }
    if (currentStep.id === "step-viewmode" && !hasActionFinished) {
      placement = "top-left";
    }

    switch (placement) {
      case "bottom":
        baseTop = targetRect.top + targetRect.height + margin;
        baseLeft = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case "top":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case "right":
        baseTop = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        baseLeft = targetRect.left + targetRect.width + margin;
        break;
      case "top-right":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left + targetRect.width + margin;
        break;
      case "top-left":
        baseTop = targetRect.top - tooltipHeight - margin;
        baseLeft = targetRect.left - tooltipWidth - margin;
        break;
      case "left":
        baseTop = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        baseLeft = targetRect.left - tooltipWidth - margin;
        break;
      default:
        baseTop = targetRect.top + targetRect.height + margin;
        baseLeft = targetRect.left;
    }

    if (baseLeft < 16) baseLeft = 16;
    if (baseLeft + tooltipWidth > windowWidth - 16) {
      baseLeft = windowWidth - tooltipWidth - 16;
    }
    if (baseTop < 16) baseTop = 16;
    if (baseTop + tooltipHeight > windowHeight - 16) {
      baseTop = windowHeight - tooltipHeight - 16;
    }

    return {
      ...defaultStyle,
      top: `${baseTop}px`,
      left: `${baseLeft}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: isDragging ? "none" : "top 0.25s ease, left 0.25s ease",
    };
  };

  const isLastStep = currentTourStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentTourStep === 0;

  return {
    isTourActive,
    currentStep,
    currentTourStep,
    isFirstStep,
    isLastStep,
    targetRect,
    hasActionFinished,
    tooltipRef,
    tooltipStyle: getTooltipStyle(),
    handleMouseDown,
    nextTourStep,
    prevTourStep,
    skipTourStep,
    totalSteps: TOUR_STEPS.length,
  };
}
