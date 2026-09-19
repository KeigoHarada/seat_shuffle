import React, { useMemo } from "react";
import { useStore } from "../../stores/appStore";
import { usePrintSessionStore } from "../../stores/printSession";
import { createPrintPlan } from "../../services/printLayout";
import PrintDialog from "./PrintDialog";
import PrintSheet from "./PrintSheet";

const PrintArea: React.FC = () => {
  const students = useStore((state) => state.students);
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);

  const isDialogOpen = usePrintSessionStore((state) => state.isDialogOpen);
  const draftMode = usePrintSessionStore((state) => state.draftMode);
  const draftOrientation = usePrintSessionStore(
    (state) => state.draftOrientation,
  );
  const dialogSelectedIds = usePrintSessionStore(
    (state) => state.dialogSelectedIds,
  );
  const setDraftMode = usePrintSessionStore((state) => state.setDraftMode);
  const setDraftOrientation = usePrintSessionStore(
    (state) => state.setDraftOrientation,
  );
  const closePrintDialog = usePrintSessionStore(
    (state) => state.closePrintDialog,
  );
  const confirmPrint = usePrintSessionStore((state) => state.confirmPrint);

  const source = useMemo(
    () => ({ students, seats, objects }),
    [students, seats, objects],
  );

  const dialogPlan = createPrintPlan(
    source,
    draftMode,
    dialogSelectedIds,
    draftOrientation,
  );

  return (
    <>
      <PrintSheet selectedIds={isDialogOpen ? dialogSelectedIds : undefined} />
      {isDialogOpen && dialogPlan.kind === "ready" ? (
        <PrintDialog
          draftMode={draftMode}
          draftOrientation={draftOrientation}
          onChangeMode={setDraftMode}
          onChangeOrientation={setDraftOrientation}
          onConfirm={confirmPrint}
          onCancel={closePrintDialog}
        />
      ) : null}
    </>
  );
};

export default PrintArea;
