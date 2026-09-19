import React from "react";
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
import { useTourOverlay } from "../../hooks/useTourOverlay";

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
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
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
              <span>{totalSteps}</span>
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
