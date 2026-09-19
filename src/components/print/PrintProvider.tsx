import React, { createContext, useCallback, useContext, useMemo } from "react";
import { flushSync } from "react-dom";
import { useStore } from "../../stores";
import { useCanvasSelectionStore } from "../../stores/canvasSelection";
import { usePrintSessionStore } from "../../stores/printSession";
import { showToast } from "../../stores/toast";
import { createPrintPlan, type PrintMode } from "../../utils/printLayout";
import PrintDialog from "./PrintDialog";
import PrintSheet from "./PrintSheet";

const PrintContext = createContext<{ requestPrint: () => void } | null>(null);

export function usePrint() {
  const context = useContext(PrintContext);
  if (!context) {
    throw new Error("usePrint must be used within PrintProvider");
  }
  return context;
}

export const PrintProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const students = useStore((state) => state.students);
  const liveSelectedIds = useCanvasSelectionStore((state) => state.selectedIds);
  const dialogOpen = usePrintSessionStore((state) => state.dialogOpen);
  const draftMode = usePrintSessionStore((state) => state.draftMode);
  const confirmedMode = usePrintSessionStore((state) => state.confirmedMode);
  const frozenIds = usePrintSessionStore((state) => state.frozenIds);

  const source = useMemo(
    () => ({ seats, objects, students }),
    [seats, objects, students],
  );

  const requestPrint = useCallback(() => {
    const preview = createPrintPlan(source, draftMode, liveSelectedIds);
    if (preview.kind === "empty") {
      showToast.info("印刷できる座席や図形がありません");
      return;
    }
    usePrintSessionStore.getState().openDialog(liveSelectedIds);
  }, [draftMode, liveSelectedIds, source]);

  const printMode: PrintMode = dialogOpen
    ? draftMode
    : (confirmedMode ?? "wall");
  const printIds = dialogOpen ? (frozenIds ?? []) : liveSelectedIds;
  const plan = createPrintPlan(source, printMode, printIds);
  const dialogPlan = createPrintPlan(source, draftMode, frozenIds ?? []);

  const confirmPrint = () => {
    const nextPlan = createPrintPlan(source, draftMode, frozenIds ?? []);
    if (nextPlan.kind === "empty") {
      showToast.info("印刷できる座席や図形がありません");
      usePrintSessionStore.getState().closeDialog();
      return;
    }
    flushSync(() => {
      usePrintSessionStore.getState().confirmMode();
    });
    window.print();
    usePrintSessionStore.getState().closeDialog();
  };

  return (
    <PrintContext.Provider value={{ requestPrint }}>
      <div data-screen-root>
        {children}
        {dialogOpen && dialogPlan.kind === "ready" ? (
          <PrintDialog
            draftMode={draftMode}
            orientation={dialogPlan.orientation}
            onChangeMode={(mode) =>
              usePrintSessionStore.getState().setDraftMode(mode)
            }
            onConfirm={confirmPrint}
            onCancel={() => usePrintSessionStore.getState().closeDialog()}
          />
        ) : null}
      </div>
      <PrintSheet plan={plan} />
    </PrintContext.Provider>
  );
};
