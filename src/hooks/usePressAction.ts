import { useRef, type PointerEvent } from "react";

export function usePressAction(action: () => void) {
  const fromTouchRef = useRef(false);

  return {
    onPointerUp: (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      fromTouchRef.current = true;
      action();
    },
    onClick: () => {
      if (fromTouchRef.current) {
        fromTouchRef.current = false;
        return;
      }
      action();
    },
  };
}
