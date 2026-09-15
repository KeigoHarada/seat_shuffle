import { useEffect, useState } from "react";
import {
  phoneMediaQuery,
  shellKindFromWidth,
  type ShellKind,
} from "../layout/shell";

export function useShellKind(): ShellKind {
  const [kind, setKind] = useState<ShellKind>(() =>
    typeof window === "undefined"
      ? "desktop"
      : shellKindFromWidth(window.innerWidth),
  );

  useEffect(() => {
    const media = window.matchMedia(phoneMediaQuery());
    const apply = () => {
      setKind(media.matches ? "phone" : "desktop");
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return kind;
}
