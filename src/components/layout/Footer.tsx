import React, { useState } from "react";
import LegalModal from "../ui/LegalModal";
import ShuffleControls from "./ShuffleControls";
import ViewModeToggle from "./ViewModeToggle";

const Footer: React.FC = () => {
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  return (
    <footer className="app-footer">
      <div className="app-footer-cluster app-footer-cluster-start">
        <button
          type="button"
          className="app-legal-link"
          onClick={() => setIsLegalModalOpen(true)}
        >
          利用規約・免責事項
        </button>
      </div>
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
      />
      <div className="app-footer-cluster app-footer-cluster-center">
        <ShuffleControls layout="footer" />
      </div>
      <div className="app-footer-cluster app-footer-cluster-end">
        <ViewModeToggle />
      </div>
    </footer>
  );
};

export default Footer;
