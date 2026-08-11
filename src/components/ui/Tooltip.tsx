import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 300,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Position above the element, centered
        setPosition({
          top: rect.top - 8,
          left: rect.left + rect.width / 2,
        });
      }
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) return children;

  return (
    <>
      {/* Target element */}
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        style={{ display: "inline-block", width: "100%", overflow: "hidden" }}
      >
        {children}
      </div>

      {/* Tooltip Portal / Overlay */}
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "var(--c-surface)",
            color: "var(--c-text-main)",
            padding: "8px 12px",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            fontWeight: 700,
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "240px",
            boxShadow: "var(--shadow-2)",
            border: "1px solid var(--c-border)",
            zIndex: 9999,
            pointerEvents: "none",
            animation: "fadeIn 0.2s ease",
            lineHeight: 1.4,
          }}
        >
          {content}

          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              bottom: "-4px",
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: "8px",
              height: "8px",
              backgroundColor: "var(--c-surface)",
              borderRight: "1px solid var(--c-border)",
              borderBottom: "1px solid var(--c-border)",
            }}
          />
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -90%); }
          to { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </>
  );
};

export default Tooltip;
