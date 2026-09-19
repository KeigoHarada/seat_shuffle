import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "../../../stores";
import { useCanvasSelectionStore } from "../../../stores/canvasSelection";
import { usePrintSessionStore } from "../../../stores/printSession";
import { useToastStore } from "../../../stores/toast";
import { PrintProvider, usePrint } from "../PrintProvider";

function PrintTrigger() {
  const { requestPrint } = usePrint();
  return (
    <button id="btn-footer-print" type="button" onClick={requestPrint}>
      印刷
    </button>
  );
}

describe("PrintProvider", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let printMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    printMock = vi.fn();
    vi.stubGlobal("print", printMock);
    usePrintSessionStore.setState({
      mode: "wall",
    });
    useCanvasSelectionStore.setState({ selectedIds: [] });
    useToastStore.setState({ toasts: [] });
  });

  afterEach(async () => {
    const currentRoot = root;
    if (currentRoot) {
      await act(async () => {
        currentRoot.unmount();
      });
      root = null;
    }
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.unstubAllGlobals();
  });

  it("toasts and skips the dialog when the canvas is empty", async () => {
    useStore.setState({ seats: [], objects: [] });

    await act(async () => {
      root?.render(
        <PrintProvider>
          <PrintTrigger />
        </PrintProvider>,
      );
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>("#btn-footer-print")?.click();
    });

    expect(document.querySelector("#print-dialog")).toBeNull();
    expect(
      useToastStore.getState().toasts.map((toast) => toast.message),
    ).toEqual(["印刷できる座席や図形がありません"]);
    expect(printMock).not.toHaveBeenCalled();
  });

  it("opens the dialog and prints the dedicated sheet on confirm", async () => {
    useStore.setState({
      seats: [
        {
          id: "seat-a",
          studentId: "stu-a",
          groupIds: [],
          x: 0,
          y: 0,
          isLocked: false,
        },
      ],
      objects: [
        {
          id: "desk",
          type: "rectangle",
          x: 8,
          y: -4,
          width: 8,
          height: 4,
          text: "教卓",
        },
      ],
      students: [
        {
          id: "stu-a",
          name: "山田太郎",
          furigana: "やまだたろう",
          gender: "male",
          attendanceNumber: 1,
          roleIds: [],
        },
      ],
    });

    await act(async () => {
      root?.render(
        <PrintProvider>
          <PrintTrigger />
        </PrintProvider>,
      );
    });

    expect(document.querySelector("[data-print-root]")).not.toBeNull();
    expect(
      document.querySelector("[data-print-seat-id='seat-a']")?.textContent,
    ).toContain("山田太郎");
    expect(
      document.querySelector("[data-print-landmark-id='desk']")?.textContent,
    ).toBe("教卓");

    await act(async () => {
      container.querySelector<HTMLButtonElement>("#btn-footer-print")?.click();
    });

    const dialog = document.querySelector("#print-dialog");
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain("掲示用（文字を正立）");
    expect(dialog?.textContent).toContain("A4 横（自動）");

    await act(async () => {
      document.querySelector<HTMLButtonElement>("#btn-print-confirm")?.click();
    });

    expect(printMock).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#print-dialog")).toBeNull();
    expect(usePrintSessionStore.getState().mode).toBe("wall");
    expect(
      document.querySelector<HTMLElement>("[data-print-seat-id='seat-a']")
        ?.style.left,
    ).toMatch(/%$/);
  });

  it("rotates seat and landmark text in desk mode", async () => {
    usePrintSessionStore.setState({ mode: "desk" });
    useStore.setState({
      seats: [
        {
          id: "seat-a",
          studentId: "stu-a",
          groupIds: [],
          x: 0,
          y: 0,
          isLocked: false,
        },
      ],
      objects: [
        {
          id: "desk",
          type: "rectangle",
          x: 8,
          y: -4,
          width: 8,
          height: 4,
          text: "教卓",
        },
      ],
      students: [
        {
          id: "stu-a",
          name: "山田太郎",
          furigana: "やまだたろう",
          gender: "male",
          attendanceNumber: 1,
          roleIds: [],
        },
      ],
    });

    await act(async () => {
      root?.render(
        <PrintProvider>
          <PrintTrigger />
        </PrintProvider>,
      );
    });

    expect(
      document.querySelector<HTMLElement>(".print-seat-label")?.style.transform,
    ).toBe("rotate(180deg)");
    expect(
      document.querySelector<HTMLElement>(".print-landmark-text")?.style
        .transform,
    ).toBe("rotate(180deg)");
  });

  it("prints the selection frozen when the dialog opened", async () => {
    useStore.setState({
      seats: [
        {
          id: "seat-a",
          studentId: null,
          groupIds: [],
          x: 0,
          y: 0,
          isLocked: false,
        },
        {
          id: "seat-b",
          studentId: null,
          groupIds: [],
          x: 12,
          y: 0,
          isLocked: false,
        },
      ],
      objects: [],
      students: [],
    });
    useCanvasSelectionStore.setState({ selectedIds: ["seat-a"] });

    await act(async () => {
      root?.render(
        <PrintProvider>
          <PrintTrigger />
        </PrintProvider>,
      );
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>("#btn-footer-print")?.click();
    });
    expect(
      document.querySelector("[data-print-seat-id='seat-a']"),
    ).not.toBeNull();
    expect(document.querySelector("[data-print-seat-id='seat-b']")).toBeNull();

    await act(async () => {
      useCanvasSelectionStore.setState({ selectedIds: [] });
    });
    expect(
      document.querySelector("[data-print-seat-id='seat-a']"),
    ).not.toBeNull();
    expect(document.querySelector("[data-print-seat-id='seat-b']")).toBeNull();
  });
});
