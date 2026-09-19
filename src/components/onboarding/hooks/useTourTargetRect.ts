import { useState, useCallback, useEffect } from "react";
import type { TourStep } from "../../../types/onboarding";

export interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface UseTourTargetRectOptions {
  isTourActive: boolean;
  currentStep: TourStep | undefined;
  hasActionFinished: boolean;
  activeSettingsTab: string;
}

export function useTourTargetRect({
  isTourActive,
  currentStep,
  hasActionFinished,
  activeSettingsTab,
}: UseTourTargetRectOptions): TargetRect | null {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

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

  return targetRect;
}
