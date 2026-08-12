import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  small?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "選択してください（複数可）",
  small = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectedOptions = options.filter((o) =>
    selectedValues.includes(o.value),
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: small ? "4px 8px" : "8px 12px",
          backgroundColor: "var(--c-surface)",
          border: `1px solid ${isOpen ? "var(--c-primary)" : "var(--c-border)"}`,
          borderRadius: "var(--radius-md)",
          fontSize: small ? "11px" : "13px",
          fontWeight: small ? 700 : 400,
          color:
            selectedValues.length > 0
              ? "var(--c-text-main)"
              : "var(--c-text-placeholder)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            textAlign: "left",
          }}
        >
          {selectedValues.length > 0
            ? selectedOptions.map((opt, i) => (
                <span
                  key={opt.value}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                    verticalAlign: "middle",
                    marginRight: i < selectedOptions.length - 1 ? "4px" : "0",
                  }}
                >
                  {opt.icon}
                  {opt.label}
                  {i < selectedOptions.length - 1 ? "," : ""}
                </span>
              ))
            : placeholder}
        </div>
        <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: "4px" }} />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              ...dropdownStyle,
              backgroundColor: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-2)",
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "4px 0",
            }}
          >
            {options.length === 0 ? (
              <div
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  color: "var(--c-text-sub)",
                }}
              >
                選択肢がありません
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleValue(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: small ? "6px 8px" : "8px 12px",
                      cursor: "pointer",
                      fontSize: small ? "11px" : "13px",
                      fontWeight: small ? 700 : 400,
                      backgroundColor: isSelected
                        ? "var(--c-primary-pale)"
                        : "transparent",
                      color: isSelected
                        ? "var(--c-primary-hover)"
                        : "var(--c-text-main)",
                    }}
                  >
                    <div
                      style={{
                        width: small ? "14px" : "16px",
                        height: small ? "14px" : "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "8px",
                        flexShrink: 0,
                        border: "1px solid",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: isSelected
                          ? "var(--c-primary-pale)"
                          : "var(--c-surface)",
                        borderColor: isSelected
                          ? "var(--c-primary)"
                          : "var(--c-border)",
                      }}
                    >
                      {isSelected && (
                        <Check
                          size={small ? 10 : 12}
                          color="var(--c-primary)"
                        />
                      )}
                    </div>
                    {opt.icon && (
                      <span style={{ marginRight: "4px", display: "flex" }}>
                        {opt.icon}
                      </span>
                    )}
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MultiSelect;
