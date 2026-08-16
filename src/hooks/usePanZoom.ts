import React, { useState, useRef, useEffect, useCallback } from "react";
import { Seat, CanvasObject } from "../types";
import { calculateCenterPanZoom } from "../utils/canvas";

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;

export const usePanZoom = (
  seats: Seat[] = [],
  objects: CanvasObject[] = [],
) => {
  const [transform, setTransform] = useState({
    pan: { x: 0, y: 0 },
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [isSpaceMode, setIsSpaceMode] = useState(false);
  const hasAutoCenteredRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) setIsZoomMode(true);
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scrolling
        setIsSpaceMode(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) setIsZoomMode(false);
      if (e.code === "Space") setIsSpaceMode(false);
    };
    const handleBlur = () => {
      setIsZoomMode(false);
      setIsSpaceMode(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.01;
        const delta = -e.deltaY * zoomSensitivity;

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setTransform((prev) => {
          const newScale = Math.min(
            Math.max(MIN_SCALE, prev.scale * Math.exp(delta)),
            MAX_SCALE,
          );
          const f = newScale / prev.scale;

          return {
            scale: newScale,
            pan: {
              x: mouseX - (mouseX - prev.pan.x) * f,
              y: mouseY - (mouseY - prev.pan.y) * f,
            },
          };
        });
      } else {
        setTransform((prev) => ({
          ...prev,
          pan: {
            x: prev.pan.x - e.deltaX,
            y: prev.pan.y - e.deltaY,
          },
        }));
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, forcePan: boolean) => {
      if (e.button === 2 || (e.button === 0 && forcePan)) {
        setIsPanning(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        return true; // Indicates pan started
      }
      return false;
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setTransform((prev) => ({
          ...prev,
          pan: {
            x: prev.pan.x + e.movementX,
            y: prev.pan.y + e.movementY,
          },
        }));
      }
    },
    [isPanning],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setIsPanning(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [isPanning],
  );

  const resetView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) {
      setTransform({ pan: { x: 0, y: 0 }, scale: 1 });
      return;
    }

    const viewportWidth = el.clientWidth;
    const viewportHeight = el.clientHeight;

    const result = calculateCenterPanZoom(
      seats,
      objects,
      viewportWidth,
      viewportHeight,
      60,
      MIN_SCALE,
      MAX_SCALE,
    );

    setTransform(result);
  }, [seats, objects]);

  // 初回マウント時、ビューポートのサイズが取得できたら自動で画面中央に配置
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    if (
      !hasAutoCenteredRef.current &&
      el.clientWidth > 0 &&
      el.clientHeight > 0
    ) {
      hasAutoCenteredRef.current = true;
      resetView();
    }
  }, [resetView, seats.length, objects.length]);

  return {
    pan: transform.pan,
    scale: transform.scale,
    isPanning,
    isZoomMode,
    isSpaceMode,
    viewportRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
  };
};
