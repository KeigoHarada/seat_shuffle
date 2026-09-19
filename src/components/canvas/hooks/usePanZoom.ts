import React, { useState, useRef, useEffect, useCallback } from "react";
import { COMPACT_MAX_WIDTH_PX } from "../../../constants/layout";
import type { Seat } from "../../../types/seat";
import type { CanvasObject, Point } from "../../../types/canvas";
import { calculateCenterPanZoom } from "../../../services/canvasGeometry";
import {
  MIN_SCALE,
  MAX_SCALE,
  panByDelta,
  pointerDistance,
  pointerMidpoint,
  tryReleasePointerCapture,
  trySetPointerCapture,
  zoomAroundPoint,
} from "../../../services/canvasGesture";

const DESKTOP_FIT_PADDING = 60;
const COMPACT_FIT_PADDING = 24;

type PinchSession = {
  startDistance: number;
  startScale: number;
  startPan: Point;
  startMid: Point;
};

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
  const transformRef = useRef(transform);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const panSessionRef = useRef<Point | null>(null);
  const pinchRef = useRef<PinchSession | null>(null);

  transformRef.current = transform;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) setIsZoomMode(true);
      if (e.code === "Space") {
        e.preventDefault();
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

        setTransform((prev) =>
          zoomAroundPoint(prev.pan, prev.scale, prev.scale * Math.exp(delta), {
            x: mouseX,
            y: mouseY,
          }),
        );
      } else {
        setTransform((prev) => ({
          ...prev,
          pan: panByDelta(prev.pan, -e.deltaX, -e.deltaY),
        }));
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const trackPointer = useCallback((e: React.PointerEvent) => {
    if (
      e.isPrimary &&
      pinchRef.current == null &&
      pointersRef.current.size > 0 &&
      !pointersRef.current.has(e.pointerId)
    ) {
      pointersRef.current.clear();
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }, []);

  const getPointerCount = useCallback(() => pointersRef.current.size, []);

  const captureTrackedPointers = useCallback((target: EventTarget | null) => {
    for (const pointerId of pointersRef.current.keys()) {
      trySetPointerCapture(target, pointerId);
    }
  }, []);

  const beginPinch = useCallback(() => {
    const el = viewportRef.current;
    const points = [...pointersRef.current.values()];
    if (points.length < 2 || !el) return;
    const rect = el.getBoundingClientRect();
    const mid = pointerMidpoint(points[0], points[1]);
    const current = transformRef.current;
    pinchRef.current = {
      startDistance: pointerDistance(points[0], points[1]),
      startScale: current.scale,
      startPan: { ...current.pan },
      startMid: { x: mid.x - rect.left, y: mid.y - rect.top },
    };
    panSessionRef.current = null;
    setIsPanning(false);
  }, []);

  const promoteToPinch = useCallback(
    (target: EventTarget | null) => {
      beginPinch();
      captureTrackedPointers(target);
    },
    [beginPinch, captureTrackedPointers],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, forcePan: boolean) => {
      trackPointer(e);

      if (pointersRef.current.size >= 2) {
        promoteToPinch(e.currentTarget);
        return true;
      }

      if (e.button === 2 || (e.button === 0 && forcePan)) {
        setIsPanning(true);
        panSessionRef.current = { x: e.clientX, y: e.clientY };
        trySetPointerCapture(e.currentTarget, e.pointerId);
        return true;
      }
      return false;
    },
    [promoteToPinch, trackPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      const points = [...pointersRef.current.values()];
      if (points.length >= 2) {
        if (!pinchRef.current) beginPinch();
        const pinch = pinchRef.current;
        const el = viewportRef.current;
        if (!pinch || !el || pinch.startDistance < 1) return;

        const rect = el.getBoundingClientRect();
        const mid = pointerMidpoint(points[0], points[1]);
        const origin = { x: mid.x - rect.left, y: mid.y - rect.top };
        const factor =
          pointerDistance(points[0], points[1]) / pinch.startDistance;
        const next = zoomAroundPoint(
          pinch.startPan,
          pinch.startScale,
          pinch.startScale * factor,
          pinch.startMid,
        );
        next.pan = panByDelta(
          next.pan,
          origin.x - pinch.startMid.x,
          origin.y - pinch.startMid.y,
        );
        setTransform(next);
        return;
      }

      const session = panSessionRef.current;
      if (!session) return;
      const dx = e.clientX - session.x;
      const dy = e.clientY - session.y;
      panSessionRef.current = { x: e.clientX, y: e.clientY };
      setTransform((prev) => ({
        ...prev,
        pan: panByDelta(prev.pan, dx, dy),
      }));
    },
    [beginPinch],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (e.buttons === 0) {
      pointersRef.current.clear();
    }
    pinchRef.current = null;

    if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      panSessionRef.current = { x: remaining.x, y: remaining.y };
      setIsPanning(true);
    } else {
      panSessionRef.current = null;
      setIsPanning(false);
    }

    tryReleasePointerCapture(e.currentTarget, e.pointerId);
  }, []);

  const resetView = useCallback(() => {
    const el = viewportRef.current;
    if (!el) {
      setTransform({ pan: { x: 0, y: 0 }, scale: 1 });
      return;
    }

    const viewportWidth = el.clientWidth;
    const viewportHeight = el.clientHeight;
    const padding =
      viewportWidth <= COMPACT_MAX_WIDTH_PX
        ? COMPACT_FIT_PADDING
        : DESKTOP_FIT_PADDING;

    const result = calculateCenterPanZoom(
      seats,
      objects,
      viewportWidth,
      viewportHeight,
      padding,
      MIN_SCALE,
      MAX_SCALE,
    );

    setTransform(result);
  }, [seats, objects]);

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
    trackPointer,
    getPointerCount,
    promoteToPinch,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    resetView,
  };
};
