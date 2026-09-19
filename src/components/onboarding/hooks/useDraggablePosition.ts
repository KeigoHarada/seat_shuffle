import { useState, useRef, useEffect, type MouseEvent } from "react";

export function useDraggablePosition(resetTrigger?: unknown) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartElementPos = useRef({ x: 0, y: 0 });

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
  }, [resetTrigger]);

  return { position, isDragging, handleMouseDown };
}
