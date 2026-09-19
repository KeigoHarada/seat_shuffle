import { useEffect, useState } from "react";
import { compactMediaQuery, isCompactWidth } from "../services/layout";

export function useCompactLayout(): boolean {
  const [compact, setCompact] = useState(() =>
    typeof window === "undefined" ? false : isCompactWidth(window.innerWidth),
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(compactMediaQuery());
    const apply = () => {
      setCompact(media.matches);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return compact;
}
