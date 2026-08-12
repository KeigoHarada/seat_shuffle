import React, { useState, useRef, useEffect } from "react";

export const PREDEFINED_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#22c55e", // Green
  "#eab308", // Yellow
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#64748b", // Gray
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          backgroundColor: value,
          border: `2px solid ${isOpen ? "var(--c-primary)" : "var(--c-border)"}`,
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          outline: "none",
          width: "100%",
          height: "100%",
        }}
        title="カラーを選択"
      />

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "4px",
            backgroundColor: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-2)",
            zIndex: 100,
            width: "150px",
            padding: "8px",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "6px",
          }}
        >
          {PREDEFINED_COLORS.map((color) => {
            const isSelected = color === value;
            return (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  backgroundColor: color,
                  border: isSelected
                    ? "2px solid var(--c-text-main)"
                    : "1px solid var(--c-border)",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  padding: 0,
                }}
                title={color}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
