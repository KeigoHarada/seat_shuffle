import React from "react";
import Canvas from "../../../components/canvas/Canvas";
import { useStore } from "../../../stores";
import PhoneShuffleBar from "../PhoneShuffleBar";

const PhoneSeatsScreen: React.FC = () => {
  const seats = useStore((state) => state.seats);

  return (
    <div className="phone-seats">
      <main className="app-canvas phone-seats-canvas">
        <Canvas />
        {seats.length === 0 && (
          <div className="phone-canvas-empty">
            <p className="text-title3">ツールバーから座席を追加</p>
          </div>
        )}
      </main>
      <PhoneShuffleBar />
    </div>
  );
};

export default PhoneSeatsScreen;
