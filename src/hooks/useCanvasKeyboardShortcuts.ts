import { useEffect } from "react";

interface UseCanvasKeyboardShortcutsProps {
  onDelete: () => void;
  onUnassign: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export const useCanvasKeyboardShortcuts = ({
  onDelete,
  onUnassign,
  onCopy,
  onPaste,
}: UseCanvasKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && e.altKey) {
        onUnassign();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        onDelete();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        onCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        onPaste();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDelete, onUnassign, onCopy, onPaste]);
};
