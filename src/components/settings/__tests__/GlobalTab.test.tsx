import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import GlobalTab from "../global/GlobalTab";
import { useStore } from "../../../stores";
import { useToastStore } from "../../../stores/toast";

describe("GlobalTab Support Section", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    useStore.setState({
      appSettings: {
        algorithm: "random",
        shuffleAnimation: "none",
        autoAssignAlgorithm: "right-top-down",
      },
    });
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
  });

  it("renders support card at the bottom of GlobalTab", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(container.textContent).toContain("開発者を応援・寄付する");
    expect(container.textContent).toContain("応援メッセージ・寄付を送る");
    expect(container.textContent).toContain("バックアップ・引き継ぎ");
    expect(container.textContent).toContain("バックアップを保存");
    expect(container.textContent).toContain("バックアップを読み込む");
    expect(container.textContent).not.toContain("JSON");
    expect(container.textContent).not.toContain("json");
    const accepts = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="file"]'),
    ).map((input) => input.accept);
    expect(accepts.join(" ")).not.toMatch(/json/i);

    expect(container.textContent).not.toContain("その他");
    expect(container.textContent).not.toContain("OFUSE");
    expect(container.textContent).not.toContain("URLコピー");
    expect(container.textContent).not.toContain("💌");

    const supportLink = container.querySelector(
      "#btn-support-donate",
    ) as HTMLAnchorElement;
    expect(supportLink).not.toBeNull();
    expect(supportLink.href).toBe("https://ofuse.me/o?uid=218335");
    expect(supportLink.className).toBe("btn-primary");
    expect(supportLink.target).toBe("_blank");
    expect(supportLink.getAttribute("data-ofuse-widget-button")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-id")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-size")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-color")).toBeNull();
    expect(supportLink.getAttribute("data-ofuse-text")).toBeNull();

    const buttonParent = supportLink.parentElement;
    expect(buttonParent?.style.justifyContent).toBe("center");
  });

  it("keeps test playback running until settings change", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    const playButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("テスト実行"),
    );
    expect(playButton).toBeTruthy();

    await act(async () => {
      playButton?.click();
    });
    expect(container.textContent).toContain("テスト再生中...");

    await act(async () => {
      useStore.setState((state) => ({
        appSettings: { ...state.appSettings, algorithm: "optimize" },
      }));
    });
    expect(container.textContent).toContain("テスト実行");
    expect(container.textContent).not.toContain("テスト再生中...");
  });

  it("does not load the Ofuse widget script", async () => {
    await act(async () => {
      if (root) root.render(<GlobalTab />);
    });

    expect(document.getElementById("ofuse-widget-script")).toBeNull();
    expect(
      document.querySelector(
        'script[src*="ofuse.me/assets/platform/widget.js"]',
      ),
    ).toBeNull();
  });
});

describe("GlobalTab backup", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let savedBlob: Blob | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    savedBlob = null;
    useToastStore.setState({ toasts: [] });
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: (blob: Blob) => {
        savedBlob = blob;
        return "blob:rakugae-test";
      },
      revokeObjectURL: () => {},
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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
  });

  function backupInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      "#btn-global-backup-file",
    );
    if (!input) throw new Error("backup file input missing");
    return input;
  }

  function button(label: string): HTMLButtonElement {
    const found = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.trim() === label,
    );
    if (!found) throw new Error(`button ${label} missing`);
    return found;
  }

  // jsdom's FileReader fires load after two nested setImmediate turns.
  async function loadFile(file: File) {
    const input = backupInput();
    Object.defineProperty(input, "files", {
      value: [file],
      configurable: true,
    });
    await act(async () => {
      input.dispatchEvent(new Event("change", { bubbles: true }));
      for (let i = 0; i < 3; i += 1) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    });
  }

  it("round-trips the classroom through save and load", async () => {
    useStore.getState().loadDefaultTemplate();
    const seatId = useStore.getState().seats[0].id;
    useStore
      .getState()
      .updateSeat(seatId, { studentId: "student-6", isLocked: true });

    await act(async () => {
      root?.render(<GlobalTab />);
    });
    await act(async () => {
      button("バックアップを保存").click();
    });
    expect(savedBlob).not.toBeNull();

    useStore.getState().clearState();
    expect(useStore.getState().students).toEqual([]);

    await loadFile(new File([savedBlob as Blob], "rakugae_backup.json"));

    const state = useStore.getState();
    expect(state.students).toHaveLength(30);
    expect(state.students.map((s) => s.name)).toContain("あ太郎");
    expect(state.seats.find((s) => s.id === seatId)).toMatchObject({
      studentId: "student-6",
      isLocked: true,
    });
    expect(state.groups).toHaveLength(7);
    expect(state.constraints).toHaveLength(5);
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "バックアップを読み込みました。",
    ]);
  });

  it("rejects a corrupt file and keeps the current classroom", async () => {
    useStore.getState().loadDefaultTemplate();
    const before = useStore.getState();
    await act(async () => {
      root?.render(<GlobalTab />);
    });

    await loadFile(new File(['{"version":1,"students":"x"'], "broken.json"));

    const after = useStore.getState();
    expect(after.students).toBe(before.students);
    expect(after.seats).toBe(before.seats);
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "バックアップを読み込めませんでした。現在の状態は変えていません。",
    ]);
  });
});
