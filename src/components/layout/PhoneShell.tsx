import React, { useState } from "react";
import Canvas from "../canvas/Canvas";
import { SettingsContent } from "../SettingsPanel";
import LegalModal from "../ui/LegalModal";
import {
  assertUnhandledDestination,
  assertUnhandledRosterPage,
  type PhoneDestination,
  type RosterPage,
} from "../../layout/shell";
import PhoneHeader from "./PhoneHeader";
import PhoneTabBar from "./PhoneTabBar";
import ShuffleControls from "./ShuffleControls";

const ROSTER_PAGES: { id: RosterPage; label: string }[] = [
  { id: "students", label: "生徒" },
  { id: "roles", label: "役割" },
  { id: "groups", label: "グループ" },
];

const PhoneRoster: React.FC = () => {
  const [page, setPage] = useState<RosterPage>("students");

  let settingsTab: "students" | "roles" | "groups";
  switch (page) {
    case "students":
      settingsTab = "students";
      break;
    case "roles":
      settingsTab = "roles";
      break;
    case "groups":
      settingsTab = "groups";
      break;
    default:
      return assertUnhandledRosterPage(page);
  }

  return (
    <div className="phone-roster">
      <div className="phone-roster-switch" role="tablist">
        {ROSTER_PAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={page === item.id}
            className={
              page === item.id
                ? "phone-roster-switch-btn on"
                : "phone-roster-switch-btn"
            }
            onClick={() => setPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <SettingsContent activeTab={settingsTab} />
    </div>
  );
};

const PhoneDestinationView: React.FC<{ destination: PhoneDestination }> = ({
  destination,
}) => {
  switch (destination) {
    case "seats":
      return (
        <main className="app-canvas">
          <Canvas />
        </main>
      );
    case "roster":
      return <PhoneRoster />;
    case "constraints":
      return (
        <div className="phone-settings-screen">
          <SettingsContent activeTab="constraints" />
        </div>
      );
    default:
      return assertUnhandledDestination(destination);
  }
};

const PhoneShell: React.FC = () => {
  const [destination, setDestination] = useState<PhoneDestination>("seats");
  const [legalOpen, setLegalOpen] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(false);

  return (
    <div className="app-shell" data-kind="phone">
      <PhoneHeader
        onOpenGlobal={() => setGlobalOpen(true)}
        onOpenLegal={() => setLegalOpen(true)}
      />
      <div className="phone-body" data-phone-destination={destination}>
        <PhoneDestinationView destination={destination} />
      </div>
      {destination === "seats" && (
        <div className="phone-shuffle-bar">
          <ShuffleControls layout="phone" />
        </div>
      )}
      <PhoneTabBar destination={destination} onChange={setDestination} />
      <LegalModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
      {globalOpen && (
        <div className="phone-overlay">
          <div className="phone-overlay-bar">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setGlobalOpen(false)}
            >
              閉じる
            </button>
          </div>
          <SettingsContent activeTab="global" />
        </div>
      )}
    </div>
  );
};

export default PhoneShell;
