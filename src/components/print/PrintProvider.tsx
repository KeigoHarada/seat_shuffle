import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useStore } from "../../stores/appStore";
import { useCanvasSelectionStore } from "../../stores/canvasSelection";
import { usePrintSessionStore } from "../../stores/printSession";
import { showToast } from "../../stores/toast";
import { createPrintPlan } from "../../services/printLayout";
import type { PrintMode, PrintOrientation } from "../../types/print";
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

function printSourceFromStore() {
  const { students, seats, objects } = useStore.getState();
  return { students, seats, objects };
}

export const PrintProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const students = useStore((state) => state.students);
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<PrintMode>("wall");
  const [draftOrientation, setDraftOrientation] =
    useState<PrintOrientation>("landscape");
  const [dialogSelectedIds, setDialogSelectedIds] = useState<readonly string[]>(
    [],
  );

  const source = useMemo(
    () => ({ students, seats, objects }),
    [students, seats, objects],
  );

  const requestPrint = useCallback(() => {
    const selectedIds = useCanvasSelectionStore.getState().selectedIds;
    const { mode, orientation } = usePrintSessionStore.getState();
    const preview = createPrintPlan(
      printSourceFromStore(),
      mode,
      selectedIds,
      orientation,
    );
    if (preview.kind === "empty") {
      showToast.info("印刷できる座席や図形がありません");
      return;
    }
    setDraftMode(mode);
    setDraftOrientation(orientation);
    setDialogSelectedIds(selectedIds);
    setDialogOpen(true);
  }, []);

  const dialogPlan = createPrintPlan(
    source,
    draftMode,
    dialogSelectedIds,
    draftOrientation,
  );

  const confirmPrint = () => {
    flushSync(() => {
      const session = usePrintSessionStore.getState();
      session.setMode(draftMode);
      session.setOrientation(draftOrientation);
    });
    window.print();
    setDialogOpen(false);
  };

  return (
    <PrintContext.Provider value={{ requestPrint }}>
      {children}
      <PrintSheet selectedIds={dialogOpen ? dialogSelectedIds : undefined} />
      {dialogOpen && dialogPlan.kind === "ready" ? (
        <PrintDialog
          draftMode={draftMode}
          draftOrientation={draftOrientation}
          onChangeMode={setDraftMode}
          onChangeOrientation={setDraftOrientation}
          onConfirm={confirmPrint}
          onCancel={() => setDialogOpen(false)}
        />
      ) : null}
    </PrintContext.Provider>
  );
};
