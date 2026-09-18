import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DesktopHeader from "../DesktopHeader";
import { useStore } from "../../../stores";
import { useToastStore } from "../../../stores/toast";

const BACKUP_IMPORT_EXPLAIN =
  "バックアップファイルを読み込むと、いまの教室を置き換えます。壊れたファイルは読み込みません。";
const BACKUP_EXPORT_EXPLAIN =
  "いまの教室の状態をバックアップファイルとして保存します。";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

function button(container: ParentNode, label: string): HTMLButtonElement {
  const found = Array.from(container.querySelectorAll("button")).find(
    (b) =>
      b.textContent?.trim() === label || b.getAttribute("aria-label") === label,
  );
  if (!found) throw new Error(`button ${label} missing`);
  return found;
}

async function chooseFile(
  input: HTMLInputElement,
  name: string,
  body: BlobPart,
  type: string,
) {
  const file = new File([body], name, { type });
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
    for (let i = 0; i < 3; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  });
}

describe("DesktopHeader project IO", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;
  let savedBlob: Blob | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    savedBlob = null;
    useToastStore.setState({ toasts: [] });
    mockMatchMedia(false);
    window.innerWidth = 1280;
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

  async function renderHeader() {
    await act(async () => {
      root?.render(
        <DesktopHeader showSettings={false} onToggleSettings={() => {}} />,
      );
    });
  }

  function backupInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    if (!input) throw new Error("backup file input missing");
    return input;
  }

  it("puts インポート and エクスポート on the header for backup only", async () => {
    await renderHeader();
    expect(button(container, "インポート")).toBeTruthy();
    expect(button(container, "エクスポート")).toBeTruthy();
    expect(container.querySelector("#btn-header-import")).toBeTruthy();
    expect(container.querySelector("#btn-header-export")).toBeTruthy();
    expect(container.querySelector("#btn-header-roster")).toBeNull();
    expect(container.querySelector("#btn-header-backup")).toBeNull();
    expect(container.textContent).not.toContain("名簿を取り込む");
    expect(container.querySelector('input[accept*="csv"]')).toBeNull();
    expect(container.textContent).not.toContain("JSON");
    expect(container.textContent).not.toMatch(/json/i);

    await act(async () => {
      button(container, "インポート").click();
    });
    const importModal = document.querySelector(".modal-overlay");
    expect(importModal?.parentElement).toBe(document.body);
    expect(container.querySelector("header")?.contains(importModal)).toBe(
      false,
    );
    expect(importModal?.textContent).toContain("インポート");
    expect(importModal?.textContent).toContain(BACKUP_IMPORT_EXPLAIN);
    expect(importModal?.textContent).toContain("バックアップファイル");
    expect(importModal?.textContent).not.toContain("ExcelやCSVの名簿");
    expect(importModal?.textContent).not.toContain("名簿を読み込む");
    expect(importModal?.textContent).not.toContain(
      "1行目に「名前」列があるCSVを読み込みます。空の名前はスキップします。",
    );
    expect(importModal?.textContent).not.toContain("JSON");

    await act(async () => {
      button(importModal ?? container, "キャンセル").click();
    });

    await act(async () => {
      button(container, "エクスポート").click();
    });
    const exportModal = document.querySelector(".modal-overlay");
    expect(exportModal?.parentElement).toBe(document.body);
    expect(container.querySelector("header")?.contains(exportModal)).toBe(
      false,
    );
    expect(exportModal?.textContent).toContain("エクスポート");
    expect(exportModal?.textContent).toContain(BACKUP_EXPORT_EXPLAIN);
    expect(button(exportModal ?? container, "保存")).toBeTruthy();
    expect(exportModal?.textContent).not.toContain("バックアップファイルを保存");
    expect(exportModal?.textContent).not.toContain("JSON");
  });

  it("round-trips the classroom through export save and import load", async () => {
    useStore.getState().loadDefaultTemplate();
    const seatId = useStore.getState().seats[0].id;
    useStore
      .getState()
      .updateSeat(seatId, { studentId: "student-6", isLocked: true });

    await renderHeader();
    await act(async () => {
      button(container, "エクスポート").click();
    });
    await act(async () => {
      button(
        document.querySelector(".modal-overlay") ?? container,
        "保存",
      ).click();
    });
    expect(savedBlob).not.toBeNull();

    useStore.getState().clearState();
    expect(useStore.getState().students).toEqual([]);

    await act(async () => {
      button(container, "インポート").click();
    });
    await act(async () => {
      button(
        document.querySelector(".modal-overlay") ?? container,
        "読み込む",
      ).click();
    });
    await chooseFile(
      backupInput(),
      "rakugae_backup.json",
      savedBlob as Blob,
      "application/octet-stream",
    );

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

  it("rejects a corrupt backup and keeps the current classroom", async () => {
    useStore.getState().loadDefaultTemplate();
    const before = useStore.getState();
    await renderHeader();
    await act(async () => {
      button(container, "インポート").click();
    });
    await act(async () => {
      button(
        document.querySelector(".modal-overlay") ?? container,
        "読み込む",
      ).click();
    });
    await chooseFile(
      backupInput(),
      "broken.json",
      '{"version":1,"students":"x"',
      "application/octet-stream",
    );

    const after = useStore.getState();
    expect(after.students).toBe(before.students);
    expect(after.seats).toBe(before.seats);
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "バックアップを読み込めませんでした。現在の状態は変えていません。",
    ]);
  });

  it("opens import and export modals at compact width without a backup menu", async () => {
    mockMatchMedia(true);
    window.innerWidth = 390;
    await renderHeader();
    expect(button(container, "インポート")).toBeTruthy();
    expect(button(container, "エクスポート")).toBeTruthy();
    expect(container.querySelector(".app-header-menu")).toBeNull();
    await act(async () => {
      button(container, "インポート").click();
    });
    const importModal = document.querySelector(".modal-overlay");
    expect(importModal?.textContent).toContain(BACKUP_IMPORT_EXPLAIN);
    expect(importModal?.textContent).not.toContain("ExcelやCSVの名簿");
    expect(container.querySelector("#btn-header-backup-save")).toBeNull();
    expect(container.querySelector("#btn-header-backup-load")).toBeNull();
  });
});
