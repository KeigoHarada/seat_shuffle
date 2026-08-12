import React, { useEffect } from "react";

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  x: number;
  y: number;
  title?: string;
  children: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onClose,
  x,
  y,
  title,
  children,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  useEffect(() => {
    if (isOpen) {
      setPosition({ x, y });
    }
  }, [isOpen, x, y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const stopEvent = (e: Event) => e.stopPropagation();

    el.addEventListener("wheel", stopEvent, { passive: false });

    return () => {
      el.removeEventListener("wheel", stopEvent);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={containerRef} style={{ position: "absolute", zIndex: 1999 }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1999,
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          backgroundColor: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-3)",
          padding: 16,
          width: 280,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          maxHeight: "50vh",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "default",
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          // Only start dragging if clicking directly on the popover background or header
          // (not on inputs, buttons, or scrollable areas if possible, but we check target)
          const target = e.target as HTMLElement;
          if (
            target.tagName.toLowerCase() === "input" ||
            target.closest("button") ||
            target.closest(".no-drag")
          ) {
            return;
          }
          setIsDragging(true);
          dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startX: position.x,
            startY: position.y,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const dx = e.clientX - dragStartRef.current.mouseX;
          const dy = e.clientY - dragStartRef.current.mouseY;
          setPosition({
            x: dragStartRef.current.startX + dx,
            y: dragStartRef.current.startY + dy,
          });
        }}
        onPointerUp={(e) => {
          if (isDragging) {
            setIsDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: title ? "space-between" : "flex-end",
            marginBottom: 12,
          }}
        >
          {title && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--c-text-main)",
              }}
            >
              {title}
            </div>
          )}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              margin: "-4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--c-text-sub)",
              borderRadius: "var(--radius-sm)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--c-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Popover;
