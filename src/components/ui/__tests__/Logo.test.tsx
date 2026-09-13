/**
 * @vitest-environment jsdom
 */
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Logo, { BrandSymbol, LogoSvg } from "../Logo";

describe("Logo Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders SVG logo inside H1 by default", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<Logo />);
    });

    const h1 = container.querySelector("h1");
    const svg = container.querySelector("svg");

    expect(h1).not.toBeNull();
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-label")).toContain("ラクガエ");
  });

  it("renders only symbol icon when variant is 'icon'", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<Logo variant="icon" />);
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 64 64");
  });

  it("renders with tagline when showTagline is true", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<Logo showTagline={true} />);
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 220 48");
    expect(svg?.textContent).toContain("席替え支援Webアプリ");
  });

  it("renders inside div wrapper when asH1 is false", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<Logo asH1={false} />);
    });

    const h1 = container.querySelector("h1");
    const div = container.querySelector("div");
    expect(h1).toBeNull();
    expect(div).not.toBeNull();
  });

  it("renders BrandSymbol directly with custom size", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<BrandSymbol size={48} />);
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
  });

  it("renders LogoSvg component directly", async () => {
    await act(async () => {
      const root = createRoot(container);
      root.render(<LogoSvg height={40} />);
    });

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("height")).toBe("40");
  });
});
