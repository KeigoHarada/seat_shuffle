import React from "react";
import {
  type PrintLandmark,
  type PrintPlan,
  type PrintSeat,
  type PrintSeatLabel,
} from "../../utils/printLayout";

function boxStyle(box: {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
}): React.CSSProperties {
  return {
    position: "absolute",
    left: `${box.leftPct}%`,
    top: `${box.topPct}%`,
    width: `${box.widthPct}%`,
    height: `${box.heightPct}%`,
  };
}

function SeatLabel({ label }: { label: PrintSeatLabel }) {
  switch (label.kind) {
    case "occupied":
      return (
        <div
          className="print-seat-label"
          style={{ transform: `rotate(${label.rotation}deg)` }}
        >
          <div className="print-seat-attendance">{label.attendanceNumber}</div>
          <div className="print-seat-furigana">{label.furigana || " "}</div>
          <div className="print-seat-name">{label.name}</div>
        </div>
      );
    case "empty":
      return (
        <div
          className="print-seat-label"
          style={{ transform: `rotate(${label.rotation}deg)` }}
        >
          <div className="print-seat-empty">空席</div>
        </div>
      );
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

function PrintSeatNode({ seat }: { seat: PrintSeat }) {
  return (
    <div
      className="print-seat"
      data-print-seat-id={seat.id}
      style={boxStyle(seat)}
    >
      <SeatLabel label={seat.label} />
    </div>
  );
}

function PrintLandmarkNode({ landmark }: { landmark: PrintLandmark }) {
  return (
    <div
      className="print-landmark"
      data-print-landmark-id={landmark.id}
      data-shape={landmark.shape}
      style={boxStyle(landmark)}
    >
      {landmark.text ? (
        <span className="print-landmark-text">{landmark.text}</span>
      ) : null}
    </div>
  );
}

const PrintSheet: React.FC<{ plan: PrintPlan }> = ({ plan }) => {
  const orientation = plan.kind === "ready" ? plan.orientation : "landscape";
  const widthMm = plan.kind === "ready" ? plan.pageWidthMm : 297;
  const heightMm = plan.kind === "ready" ? plan.pageHeightMm : 210;

  return (
    <div data-print-root data-orientation={orientation}>
      <style>
        {`@media print { @page { size: A4 ${orientation}; margin: 10mm; } }`}
      </style>
      <div
        className="print-sheet"
        data-orientation={orientation}
        style={{
          width: `${widthMm}mm`,
          aspectRatio: `${widthMm} / ${heightMm}`,
        }}
      >
        {plan.kind === "ready"
          ? plan.landmarks.map((landmark) => (
              <PrintLandmarkNode key={landmark.id} landmark={landmark} />
            ))
          : null}
        {plan.kind === "ready"
          ? plan.seats.map((seat) => (
              <PrintSeatNode key={seat.id} seat={seat} />
            ))
          : null}
      </div>
    </div>
  );
};

export default PrintSheet;
