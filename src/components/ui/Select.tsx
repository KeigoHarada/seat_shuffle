import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  small?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "選択してください",
  small = false,
}) => {
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

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const selectedOption = options.find((o) => o.value === value);

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
          color: selectedOption
            ? "var(--c-text-main)"
            : "var(--c-text-placeholder)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: "4px" }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-2)",
            zIndex: 100,
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
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: small ? "6px 8px" : "8px 12px",
                    cursor: "pointer",
                    fontSize: small ? "11px" : "13px",
                    fontWeight: small ? 700 : 400,
                    whiteSpace: "nowrap",
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
                      marginRight: "6px",
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && <Check size={small ? 12 : 14} />}
                  </div>
                  {opt.label}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
