import React from "react";
import { ChevronLeft } from "lucide-react";
import GlobalTab from "../../../components/settings/global/GlobalTab";

interface PhoneGlobalScreenProps {
  onClose: () => void;
}

const PhoneGlobalScreen: React.FC<PhoneGlobalScreenProps> = ({ onClose }) => {
  return (
    <div className="phone-overlay">
      <div className="phone-overlay-bar">
        <button type="button" className="phone-back-btn" onClick={onClose}>
          <ChevronLeft size={20} /> 戻る
        </button>
        <h2 className="phone-overlay-title">全体設定</h2>
      </div>
      <div className="phone-screen-body">
        <GlobalTab />
      </div>
    </div>
  );
};

export default PhoneGlobalScreen;
