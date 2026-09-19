import React, { useEffect, useMemo } from "react";
import { useStore } from "../../stores";
import { useCanvasSelectionStore } from "../../stores/canvasSelection";
import { usePrintSessionStore } from "../../stores/printSession";
import { createPrintPlan, type PrintPlan } from "../../utils/printLayout";

type ReadyPlan = Extract<PrintPlan, { kind: "ready" }>;
type ReadySeat = ReadyPlan["seats"][number];
type ReadyLandmark = ReadyPlan["landmarks"][number];

const PAGE_STYLE_ID = "rakugae-print-page";

function frameStyle(
  frame: ReadySeat["frame"],
  contentWidthMm: number,
  contentHeightMm: number,
): React.CSSProperties {
  return {
    position: "absolute",
    left: `${(frame.xMm / contentWidthMm) * 100}%`,
    top: `${(frame.yMm / contentHeightMm) * 100}%`,
    width: `${(frame.widthMm / contentWidthMm) * 100}%`,
    height: `${(frame.heightMm / contentHeightMm) * 100}%`,
  };
}

function labelTransform(rotation: 0 | 180): string | undefined {
  switch (rotation) {
    case 0:
      return undefined;
    case 180:
      return "rotate(180deg)";
    default: {
      const _exhaustive: never = rotation;
      return _exhaustive;
    }
  }
}

function SeatLabel({ label }: { label: ReadySeat["label"] }) {
  const transform = labelTransform(label.rotation);
  switch (label.kind) {
    case "empty":
      return (
        <div className="print-seat-label" style={{ transform }}>
          <div className="print-seat-empty">空席</div>
        </div>
      );
    case "occupied":
      return (
        <div className="print-seat-label" style={{ transform }}>
          <div className="print-seat-attendance">{label.attendanceNumber}</div>
          <div className="print-seat-furigana">{label.furigana ?? " "}</div>
          <div className="print-seat-name">{label.name}</div>
        </div>
      );
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

function PrintSeatNode({
  seat,
  contentWidthMm,
  contentHeightMm,
}: {
  seat: ReadySeat;
  contentWidthMm: number;
  contentHeightMm: number;
}) {
  return (
    <div
      className="print-seat"
      data-print-seat-id={seat.id}
      style={frameStyle(seat.frame, contentWidthMm, contentHeightMm)}
    >
      <SeatLabel label={seat.label} />
    </div>
  );
}

function PrintLandmarkNode({
  landmark,
  contentWidthMm,
  contentHeightMm,
}: {
  landmark: ReadyLandmark;
  contentWidthMm: number;
  contentHeightMm: number;
}) {
  return (
    <div
      className="print-landmark"
      data-print-landmark-id={landmark.id}
      data-shape={landmark.shape}
      style={frameStyle(landmark.frame, contentWidthMm, contentHeightMm)}
    >
      {landmark.text ? (
        <span
          className="print-landmark-text"
          style={{ transform: labelTransform(landmark.rotation) }}
        >
          {landmark.text}
        </span>
      ) : null}
    </div>
  );
}

const PrintSheet: React.FC<{ selectedIds?: readonly string[] }> = ({
  selectedIds,
}) => {
  const students = useStore((state) => state.students);
  const seats = useStore((state) => state.seats);
  const objects = useStore((state) => state.objects);
  const mode = usePrintSessionStore((state) => state.mode);
  const liveSelectedIds = useCanvasSelectionStore((state) => state.selectedIds);
  const targetIds = selectedIds ?? liveSelectedIds;

  const plan = useMemo(
    () => createPrintPlan({ students, seats, objects }, mode, targetIds),
    [students, seats, objects, mode, targetIds],
  );

  useEffect(() => {
    if (plan.kind !== "ready") {
      document.getElementById(PAGE_STYLE_ID)?.remove();
      return;
    }
    let el = document.getElementById(PAGE_STYLE_ID);
    if (!(el instanceof HTMLStyleElement)) {
      el?.remove();
      el = document.createElement("style");
      el.id = PAGE_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `@page { size: A4 ${plan.page.orientation}; margin: 10mm; }`;
    return () => {
      document.getElementById(PAGE_STYLE_ID)?.remove();
    };
  }, [plan]);

  switch (plan.kind) {
    case "empty":
      return null;
    case "ready":
      return (
        <div
          data-print-root
          data-orientation={plan.page.orientation}
          style={
            {
              "--print-ar-w": plan.page.contentWidthMm,
              "--print-ar-h": plan.page.contentHeightMm,
            } as React.CSSProperties
          }
        >
          <div className="print-sheet">
            {plan.landmarks.map((landmark) => (
              <PrintLandmarkNode
                key={landmark.id}
                landmark={landmark}
                contentWidthMm={plan.page.contentWidthMm}
                contentHeightMm={plan.page.contentHeightMm}
              />
            ))}
            {plan.seats.map((seat) => (
              <PrintSeatNode
                key={seat.id}
                seat={seat}
                contentWidthMm={plan.page.contentWidthMm}
                contentHeightMm={plan.page.contentHeightMm}
              />
            ))}
          </div>
        </div>
      );
    default: {
      const _exhaustive: never = plan;
      return _exhaustive;
    }
  }
};

export default PrintSheet;
