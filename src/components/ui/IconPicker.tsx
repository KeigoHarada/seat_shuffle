import React, { useState, useRef, useEffect } from "react";
import {
  Star,
  Crown,
  Flag,
  Medal,
  PenTool,
  BookOpen,
  ClipboardList,
  Eraser,
  HeartPulse,
  Activity,
  Trophy,
  Sparkles,
  Trash,
  PawPrint,
  Sprout,
  Leaf,
  Mic,
  Megaphone,
  Utensils,
  Apple,
  Palette,
  Scissors,
  Calendar,
  Clock,
  Bell,
  Users,
} from "lucide-react";

export const AVAILABLE_ICONS = {
  Star,
  Crown,
  Flag,
  Medal,
  PenTool,
  BookOpen,
  ClipboardList,
  Eraser,
  HeartPulse,
  Activity,
  Trophy,
  Sparkles,
  Trash,
  PawPrint,
  Sprout,
  Leaf,
  Mic,
  Megaphone,
  Utensils,
  Apple,
  Palette,
  Scissors,
  Calendar,
  Clock,
  Bell,
  Users,
};

export type IconName = keyof typeof AVAILABLE_ICONS;

interface IconPickerProps {
  value: IconName;
  onChange: (value: IconName) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
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

  const SelectedIcon = AVAILABLE_ICONS[value] || Star;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px",
          backgroundColor: "var(--c-surface)",
          border: `1px solid ${isOpen ? "var(--c-primary)" : "var(--c-border)"}`,
          borderRadius: "var(--radius-md)",
          color: "var(--c-text-main)",
          cursor: "pointer",
          outline: "none",
          width: "100%",
          height: "36px",
        }}
        title="アイコンを選択"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <SelectedIcon size={18} />
        </div>
      </button>

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
            width: "200px",
            padding: "8px",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "4px",
          }}
        >
          {(Object.keys(AVAILABLE_ICONS) as IconName[]).map((iconKey) => {
            const IconComp = AVAILABLE_ICONS[iconKey];
            const isSelected = iconKey === value;
            return (
              <button
                key={iconKey}
                onClick={() => {
                  onChange(iconKey);
                  setIsOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0",
                  backgroundColor: isSelected
                    ? "var(--c-primary-pale)"
                    : "transparent",
                  color: isSelected
                    ? "var(--c-primary-hover)"
                    : "var(--c-text-main)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
                title={iconKey}
              >
                <IconComp size={18} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IconPicker;
