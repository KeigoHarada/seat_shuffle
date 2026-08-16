/**
 * @vitest-environment jsdom
 */
import { createRef, act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Checkbox from "../Checkbox";

describe("Checkbox Component", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders a standard checkbox input when no label is provided", async () => {
    // Arrange & Act
    await act(async () => {
      const root = createRoot(container);
      root.render(<Checkbox defaultChecked />);
    });
    const input = container.querySelector(
      "input[type='checkbox']",
    ) as HTMLInputElement;

    // Assert
    expect(input).not.toBeNull();
    expect(input.checked).toBe(true);
    expect(container.querySelector("label")).toBeNull();
  });

  it("wraps with a label when label prop is provided", async () => {
    // Arrange & Act
    await act(async () => {
      const root = createRoot(container);
      root.render(<Checkbox label="グループ選択" />);
    });
    const label = container.querySelector("label");
    const input = container.querySelector("input[type='checkbox']");

    // Assert
    expect(label).not.toBeNull();
    expect(label?.className).toContain("checkbox-label");
    expect(label?.textContent).toContain("グループ選択");
    expect(input).not.toBeNull();
  });

  it("handles indeterminate property correctly via ref", async () => {
    // Arrange
    const ref = createRef<HTMLInputElement>();

    // Act
    await act(async () => {
      const root = createRoot(container);
      root.render(<Checkbox ref={ref} indeterminate={true} />);
    });

    // Assert
    expect(ref.current).not.toBeNull();
    expect(ref.current?.indeterminate).toBe(true);
  });

  it("handles onChange events", async () => {
    // Arrange
    const handleChange = vi.fn();
    await act(async () => {
      const root = createRoot(container);
      root.render(<Checkbox onChange={handleChange} />);
    });
    const input = container.querySelector(
      "input[type='checkbox']",
    ) as HTMLInputElement;

    // Act
    await act(async () => {
      input.click();
    });

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
