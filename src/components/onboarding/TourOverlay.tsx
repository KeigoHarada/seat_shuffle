import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Eye,
  MousePointer2,
  Lightbulb,
  Target,
} from "lucide-react";
import { useOnboardingStore } from "../../stores/onboarding";
import { TOUR_STEPS } from "../../constants/tourSteps";
import { useStore } from "../../stores";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TourOverlay: React.FC = () => {
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
  const pastSeats = useStore((state) => state.pastSeats);

  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hasActionFinished, setHasActionFinished] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartElementPos = useRef({ x: 0, y: 0 });

  const currentStep = TOUR_STEPS[currentTourStep];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragStartElementPos.current = { ...position };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
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
    pastSeats.length,
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
    let startTime = Date.now();

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

  if (!isTourActive || !currentStep) return null;

  const isLastStep = currentTourStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentTourStep === 0;

  const getTooltipStyle = (): React.CSSProperties => {
    const defaultStyle: React.CSSProperties = {
      position: "fixed",
      zIndex: 1002,
    };

    let baseTop = 0;
    let baseLeft = 0;

    if (!targetRect) {
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

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {targetRect &&
        (() => {
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
        })()}

      <div
        ref={tooltipRef}
        className="tooltip-card-mock tour-tooltip"
        style={{ ...getTooltipStyle(), pointerEvents: "auto" }}
      >
        <div
          style={{
            backgroundColor: "var(--c-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-3)",
            border: hasActionFinished
              ? "2px solid #16a34a"
              : "1px solid var(--c-border)",
            padding: "20px",
            paddingTop: "24px",
            position: "relative",
            animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "24px",
              cursor: "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderTopLeftRadius: "var(--radius-lg)",
              borderTopRightRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "4px",
                backgroundColor: "var(--c-border)",
                borderRadius: "2px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "2px 8px",
                backgroundColor: "var(--c-primary-pale)",
                color: "var(--c-primary-hover)",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <span>ステップ</span>
              <span>{currentTourStep + 1}</span>
              <span>/</span>
              <span>{TOUR_STEPS.length}</span>
            </div>

            {currentStep.isInfoOnly ? (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--c-text-sub)",
                  backgroundColor: "var(--c-bg-sub)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Eye size={12} /> 確認してください
              </span>
            ) : hasActionFinished ? (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#16a34a",
                  backgroundColor: "#dcfce7",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sparkles size={12} /> 操作完了！
              </span>
            ) : (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--c-primary-hover)",
                  backgroundColor: "var(--c-primary-pale)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <MousePointer2 size={12} /> 操作してください
              </span>
            )}
          </div>

          <h4
            className="text-title3"
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontWeight: 700,
              color: "var(--c-text-main)",
            }}
          >
            {currentStep.title}
          </h4>

          <p
            style={{
              fontSize: "13px",
              color: "var(--c-text-sub)",
              lineHeight: 1.5,
              margin: "0 0 12px 0",
            }}
          >
            {currentStep.description}
          </p>

          <div
            style={{
              padding: "8px 12px",
              backgroundColor: currentStep.isInfoOnly
                ? "var(--c-bg-sub)"
                : hasActionFinished
                  ? "#f0fdf4"
                  : "#fffbeb",
              border: currentStep.isInfoOnly
                ? "1px solid var(--c-border)"
                : hasActionFinished
                  ? "1px solid #bbf7d0"
                  : "1px solid #fde68a",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              fontWeight: 700,
              color: currentStep.isInfoOnly
                ? "var(--c-text-main)"
                : hasActionFinished
                  ? "#166534"
                  : "#92400e",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              {currentStep.isInfoOnly ? (
                <Lightbulb size={14} />
              ) : hasActionFinished ? (
                <Sparkles size={14} />
              ) : (
                <Target size={14} />
              )}
            </span>
            <span>
              {hasActionFinished
                ? "操作が完了しました。「次へ」をクリックしてください。"
                : currentStep.actionHint}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "8px",
              borderTop: "1px solid var(--c-border)",
            }}
          >
            <button
              className="btn-secondary"
              onClick={() => {
                skipTourStep();
              }}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                border: "none",
                background: "transparent",
                color: "var(--c-text-sub)",
              }}
            >
              スキップ
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-secondary"
                onClick={prevTourStep}
                disabled={isFirstStep}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  gap: "2px",
                  opacity: isFirstStep ? 0.4 : 1,
                  cursor: isFirstStep ? "default" : "pointer",
                }}
              >
                <ChevronLeft size={14} /> 前へ
              </button>

              <button
                className="btn-primary"
                onClick={nextTourStep}
                disabled={!currentStep.isInfoOnly && !hasActionFinished}
                style={{
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  gap: "4px",
                  opacity:
                    !currentStep.isInfoOnly && !hasActionFinished ? 0.4 : 1,
                  cursor:
                    !currentStep.isInfoOnly && !hasActionFinished
                      ? "default"
                      : "pointer",
                }}
              >
                {isLastStep ? (
                  <>
                    <Check size={14} /> 完了
                  </>
                ) : (
                  <>
                    次へ <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;
