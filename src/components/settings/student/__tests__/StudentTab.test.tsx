import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import StudentTab from "../StudentTab";
import { useStore } from "../../../../stores";
import { useToastStore } from "../../../../stores/toast";

const ROSTER_CONFIRM =
  "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。";

// jsdom's FileReader fires load after two nested setImmediate turns.
async function chooseFile(input: HTMLInputElement, name: string, body: string) {
  const file = new File([body], name, { type: "text/csv" });
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
    for (let i = 0; i < 3; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  });
}

describe("StudentTab roster IO", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useToastStore.setState({ toasts: [] });
    useStore.getState().loadDefaultTemplate();
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

  function rosterInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"][accept^=".csv"]',
    );
    if (!input) throw new Error("roster file input missing");
    return input;
  }

  it("shows roster and backup actions without exposing the file format", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    expect(container.textContent).toContain("名簿を取り込む");
    expect(container.textContent).toContain("バックアップを保存");
    expect(container.textContent).toContain("バックアップを読み込む");
    expect(container.textContent).not.toContain("JSON");
    expect(container.textContent).not.toContain("json");
    const accepts = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="file"]'),
    ).map((input) => input.accept);
    expect(accepts.join(" ")).not.toMatch(/json/i);
  });

  it("confirms with the locked copy, then replaces students and clears seats", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    const seatCount = useStore.getState().seats.length;
    const groupsBefore = useStore.getState().groups;

    await chooseFile(
      rosterInput(),
      "roster.csv",
      "\uFEFF名前,性別\n山田,男\n,\n鈴木,女",
    );

    const dialog = document.querySelector(".modal-overlay");
    expect(dialog?.textContent).toContain(ROSTER_CONFIRM);
    expect(useStore.getState().students.map((s) => s.name)).toContain("あ太郎");

    const confirm = Array.from(dialog?.querySelectorAll("button") ?? []).find(
      (b) => b.textContent === "取り込む",
    );
    await act(async () => {
      confirm?.click();
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
    await act(async () => {
      root?.render(<StudentTab />);
    });
    const before = useStore.getState();

    await chooseFile(
      rosterInput(),
      "settings.csv",
      "# Students\nattendanceNumber,name\n1,山田",
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
    await act(async () => {
      root?.render(<StudentTab />);
    });
    const before = useStore.getState();

    await chooseFile(rosterInput(), "empty.csv", "名前,性別\n,男\n ,女");

    expect(document.querySelector(".modal-overlay")).toBeNull();
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "取り込める名前がありません。いまの教室はそのままです",
    ]);
    expect(useStore.getState().students).toBe(before.students);
  });
});
