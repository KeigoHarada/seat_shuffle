import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
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
  const [dialogSelectedIds, setDialogSelectedIds] = useState<readonly string[]>(
    [],
  );

  const source = useMemo(
    () => ({ students, seats, objects }),
    [students, seats, objects],
  );

  const requestPrint = useCallback(() => {
    const selectedIds = useCanvasSelectionStore.getState().selectedIds;
    const mode = usePrintSessionStore.getState().mode;
    const preview = createPrintPlan(printSourceFromStore(), mode, selectedIds);
    if (preview.kind === "empty") {
      showToast.info("印刷できる座席や図形がありません");
      return;
    }
    setDraftMode(mode);
    setDialogSelectedIds(selectedIds);
    setDialogOpen(true);
  }, []);

  const dialogPlan = createPrintPlan(source, draftMode, dialogSelectedIds);

  const confirmPrint = () => {
    flushSync(() => {
      usePrintSessionStore.getState().setMode(draftMode);
      setDialogOpen(false);
    });
    window.print();
  };

  return (
    <PrintContext.Provider value={{ requestPrint }}>
      {children}
      <PrintSheet />
      {dialogOpen && dialogPlan.kind === "ready" ? (
        <PrintDialog
          draftMode={draftMode}
          orientation={dialogPlan.page.orientation}
          onChangeMode={setDraftMode}
          onConfirm={confirmPrint}
          onCancel={() => setDialogOpen(false)}
        />
      ) : null}
    </PrintContext.Provider>
  );
};
