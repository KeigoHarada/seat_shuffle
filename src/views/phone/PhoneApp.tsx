import "./phone.css";

import React, { useState } from "react";
import LegalModal from "../../components/ui/LegalModal";
import {
  assertUnhandledDestination,
  type PhoneDestination,
} from "../../layout/shell";
import PhoneHeader from "./PhoneHeader";
import PhoneTabBar from "./PhoneTabBar";
import PhoneConstraintsScreen from "./screens/PhoneConstraintsScreen";
import PhoneGlobalScreen from "./screens/PhoneGlobalScreen";
import PhoneRosterScreen from "./screens/PhoneRosterScreen";
import PhoneSeatsScreen from "./screens/PhoneSeatsScreen";

const PhoneDestinationView: React.FC<{ destination: PhoneDestination }> = ({
  destination,
}) => {
  switch (destination) {
    case "seats":
      return <PhoneSeatsScreen />;
    case "roster":
      return <PhoneRosterScreen />;
    case "constraints":
      return <PhoneConstraintsScreen />;
    default:
      return assertUnhandledDestination(destination);
  }
};

const PhoneApp: React.FC = () => {
  const [destination, setDestination] = useState<PhoneDestination>("seats");
  const [legalOpen, setLegalOpen] = useState(false);
  const [globalOpen, setGlobalOpen] = useState(false);

  return (
    <div className="app-shell phone-app" data-kind="phone">
      <PhoneHeader
        onOpenGlobal={() => setGlobalOpen(true)}
        onOpenLegal={() => setLegalOpen(true)}
      />
      <div className="phone-body" data-phone-destination={destination}>
        <PhoneDestinationView destination={destination} />
      </div>
      <PhoneTabBar destination={destination} onChange={setDestination} />
      <LegalModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
      {globalOpen && <PhoneGlobalScreen onClose={() => setGlobalOpen(false)} />}
    </div>
  );
};

export default PhoneApp;
