import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DesktopHeader from "../DesktopHeader";
import { useStore } from "../../../stores";
import { useToastStore } from "../../../stores/toast";

const ROSTER_CONFIRM =
  "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。";
const ROSTER_CSV_EXPLAIN =
  "1行目に「名前」列があるCSVを読み込みます。空の名前はスキップします。";

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
    (b) => b.textContent?.trim() === label || b.getAttribute("aria-label") === label,
  );
  if (!found) throw new Error(`button ${label} missing`);
  return found;
}

async function chooseFile(input: HTMLInputElement, name: string, body: string, type: string) {
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

  function rosterInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"][accept^=".csv"]',
    );
    if (!input) throw new Error("roster file input missing");
    return input;
  }

  function backupInput(): HTMLInputElement {
    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="file"]'),
    );
    const input = inputs.find((el) => !el.accept?.startsWith(".csv"));
    if (!input) throw new Error("backup file input missing");
    return input;
  }

  it("puts roster import and backup on the header without import/export words", async () => {
    await renderHeader();
    expect(container.textContent).toContain("名簿を取り込む");
    expect(container.textContent).toContain("バックアップ");
    expect(container.textContent).not.toContain("インポート");
    expect(container.textContent).not.toContain("エクスポート");
    expect(container.textContent).not.toContain("JSON");
    expect(container.textContent).not.toMatch(/json/i);
    await act(async () => {
      button(container, "バックアップ").click();
    });
    expect(container.textContent).toContain("保存");
    expect(container.textContent).toContain("読み込み");
    expect(container.textContent).not.toContain("インポート");
    expect(container.textContent).not.toContain("エクスポート");
  });

  it("opens a CSV format modal from 名簿を取り込む, then confirms with the locked copy", async () => {
    useStore.getState().loadDefaultTemplate();
    await renderHeader();
    const seatCount = useStore.getState().seats.length;
    const groupsBefore = useStore.getState().groups;

    await act(async () => {
      button(container, "名簿を取り込む").click();
    });
    const explain = document.querySelector(".modal-overlay");
    expect(explain?.textContent).toContain(ROSTER_CSV_EXPLAIN);
    expect(explain?.textContent).toContain("読み込む");

    await act(async () => {
      button(explain ?? container, "読み込む").click();
    });

    await chooseFile(
      rosterInput(),
      "roster.csv",
      "\uFEFF名前,性別\n山田,男\n,\n鈴木,女",
      "text/csv",
    );

    const dialog = document.querySelector(".modal-overlay");
    expect(dialog?.textContent).toContain(ROSTER_CONFIRM);
    expect(useStore.getState().students.map((s) => s.name)).toContain("あ太郎");

    await act(async () => {
      button(dialog ?? container, "取り込む").click();
    });

    const state = useStore.getState();
    expect(state.students.map((s) => s.name)).toEqual(["山田", "鈴木"]);
    expect(state.students.map((s) => s.gender)).toEqual(["male", "female"]);
    expect(state.seats).toHaveLength(seatCount);
    expect(state.seats.every((s) => s.studentId === null)).toBe(true);
    expect(state.constraints).toEqual([]);
    expect(state.groups).toEqual(groupsBefore);
    expect(document.querySelector(".modal-overlay")).toBeNull();
    const n = 1;
    const m = 2;
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      `名前のない行を${n}件スキップして、${m}人取り込みました`,
    ]);
  });

  it("leaves the classroom untouched when the file has no 名前 column", async () => {
    useStore.getState().loadDefaultTemplate();
    await renderHeader();
    const before = useStore.getState();

    await act(async () => {
      button(container, "名簿を取り込む").click();
    });
    await act(async () => {
      button(document.querySelector(".modal-overlay") ?? container, "読み込む").click();
    });
    await chooseFile(
      rosterInput(),
      "settings.csv",
      "# Students\nattendanceNumber,name\n1,山田",
      "text/csv",
    );

    expect(document.querySelector(".modal-overlay")).toBeNull();
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "名前の列が見つかりません。",
    ]);
    const after = useStore.getState();
    expect(after.students).toBe(before.students);
    expect(after.seats).toBe(before.seats);
    expect(after.constraints).toBe(before.constraints);
  });

  it("leaves the classroom untouched when every row is blank", async () => {
    useStore.getState().loadDefaultTemplate();
    await renderHeader();
    const before = useStore.getState();

    await act(async () => {
      button(container, "名簿を取り込む").click();
    });
    await act(async () => {
      button(document.querySelector(".modal-overlay") ?? container, "読み込む").click();
    });
    await chooseFile(rosterInput(), "empty.csv", "名前,性別\n,男\n ,女", "text/csv");

    expect(document.querySelector(".modal-overlay")).toBeNull();
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "取り込める名前がありません。いまの教室はそのままです",
    ]);
    expect(useStore.getState().students).toBe(before.students);
  });

  it("round-trips the classroom through backup save and load", async () => {
    useStore.getState().loadDefaultTemplate();
    const seatId = useStore.getState().seats[0].id;
    useStore
      .getState()
      .updateSeat(seatId, { studentId: "student-6", isLocked: true });

    await renderHeader();
    await act(async () => {
      button(container, "バックアップ").click();
    });
    await act(async () => {
      button(container, "保存").click();
    });
    expect(savedBlob).not.toBeNull();

    useStore.getState().clearState();
    expect(useStore.getState().students).toEqual([]);

    await act(async () => {
      button(container, "バックアップ").click();
    });
    await act(async () => {
      button(container, "読み込み").click();
    });
    await chooseFile(
      backupInput(),
      "rakugae_backup.json",
      await (savedBlob as Blob).text(),
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
      button(container, "バックアップ").click();
    });
    await act(async () => {
      button(container, "読み込み").click();
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

  it("opens a compact backup menu with 保存 and 読み込み", async () => {
    mockMatchMedia(true);
    window.innerWidth = 390;
    await renderHeader();
    expect(button(container, "名簿を取り込む")).toBeTruthy();
    expect(button(container, "バックアップ")).toBeTruthy();
    await act(async () => {
      button(container, "バックアップ").click();
    });
    expect(button(container, "保存")).toBeTruthy();
    expect(button(container, "読み込み")).toBeTruthy();
    expect(container.textContent).not.toContain("インポート");
    expect(container.textContent).not.toContain("エクスポート");
  });
});
