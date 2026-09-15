import React from "react";
import { LayoutGrid, ShieldCheck, Users } from "lucide-react";
import { PHONE_TABS, type PhoneDestination } from "../../layout/shell";

const ICONS: Record<PhoneDestination, React.ReactNode> = {
  seats: <LayoutGrid size={20} />,
  roster: <Users size={20} />,
  constraints: <ShieldCheck size={20} />,
};

interface PhoneTabBarProps {
  destination: PhoneDestination;
  onChange: (destination: PhoneDestination) => void;
}

const PhoneTabBar: React.FC<PhoneTabBarProps> = ({ destination, onChange }) => {
  return (
    <nav className="phone-tabbar" aria-label="画面">
      {PHONE_TABS.map((tab) => (
        <button
          key={tab.id}
          id={`tab-phone-${tab.id}`}
          type="button"
          className="phone-tab"
          aria-current={destination === tab.id ? "page" : undefined}
          onClick={() => onChange(tab.id)}
        >
          <span className="phone-tab-icon">{ICONS[tab.id]}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default PhoneTabBar;
