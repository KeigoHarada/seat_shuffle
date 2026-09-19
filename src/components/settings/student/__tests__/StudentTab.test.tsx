import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import StudentTab from "../StudentTab";
import { useStore } from "../../../../stores/appStore";
import { useToastStore } from "../../../../stores/toast";

const ROSTER_CONFIRM =
  "名簿だけ取り込みます。席の割り当てと条件はクリアされます（座席の配置・グループ設定はそのまま）。";
const ROSTER_CSV_EXPLAIN =
  "1行目に「名前」列があるCSVを読み込みます。空の名前はスキップします。";

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

describe("StudentTab roster editing", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    useStore.getState().loadDefaultTemplate();
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
  });

  function rosterInput(): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"][accept^=".csv"]',
    );
    if (!input) throw new Error("roster file input missing");
    return input;
  }

  it("loads roster CSV from 名簿を読み込む and has no backup IO", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    expect(container.querySelector("#student-add-form")).not.toBeNull();
    expect(button(container, "名簿を読み込む")).toBeTruthy();
    expect(container.textContent).not.toContain("名簿を取り込む");
    expect(container.textContent).not.toContain("バックアップ");
    expect(container.textContent).not.toContain("インポート");
    expect(container.textContent).not.toContain("エクスポート");
    expect(container.textContent).not.toContain("JSON");
  });

  it("opens a CSV format modal from 名簿を読み込む, then confirms with the locked copy", async () => {
    const seatCount = useStore.getState().seats.length;
    const groupsBefore = useStore.getState().groups;

    await act(async () => {
      root?.render(<StudentTab />);
    });

    await act(async () => {
      button(container, "名簿を読み込む").click();
    });
    const explain = document.querySelector(".modal-overlay");
    expect(explain?.parentElement).toBe(document.body);
    expect(explain?.textContent).toContain(ROSTER_CSV_EXPLAIN);
    expect(explain?.textContent).toContain("読み込む");
    expect(explain?.textContent).not.toContain("JSON");

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
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "名前のない行を1件スキップして、2人取り込みました",
    ]);
  });

  it("leaves the classroom untouched when the file has no 名前 column", async () => {
    await act(async () => {
      root?.render(<StudentTab />);
    });
    const before = useStore.getState();

    await act(async () => {
      button(container, "名簿を読み込む").click();
    });
    await act(async () => {
      button(
        document.querySelector(".modal-overlay") ?? container,
        "読み込む",
      ).click();
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
    await act(async () => {
      root?.render(<StudentTab />);
    });
    const before = useStore.getState();

    await act(async () => {
      button(container, "名簿を読み込む").click();
    });
    await act(async () => {
      button(
        document.querySelector(".modal-overlay") ?? container,
        "読み込む",
      ).click();
    });
    await chooseFile(
      rosterInput(),
      "empty.csv",
      "名前,性別\n,男\n ,女",
      "text/csv",
    );

    expect(document.querySelector(".modal-overlay")).toBeNull();
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual([
      "取り込める名前がありません。いまの教室はそのままです",
    ]);
    expect(useStore.getState().students).toBe(before.students);
  });
});
