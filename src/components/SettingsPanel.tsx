import React from "react";
import {
  Users,
  UserCircle,
  UsersRound,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import StudentTab from "./settings/student/StudentTab";
import RoleTab from "./settings/role/RoleTab";
import GroupTab from "./settings/group/GroupTab";
import ConstraintTab from "./settings/constraint/ConstraintTab";
import GlobalTab from "./settings/global/GlobalTab";
import { useStore } from "../stores";

type Tab = "students" | "roles" | "groups" | "constraints" | "global";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "students", label: "生徒", icon: <Users size={16} /> },
  { id: "roles", label: "役割", icon: <UserCircle size={16} /> },
  { id: "groups", label: "グループ", icon: <UsersRound size={16} /> },
  { id: "constraints", label: "条件", icon: <ShieldCheck size={16} /> },
  { id: "global", label: "設定", icon: <Settings2 size={16} /> },
];

const SettingsTabs: React.FC<{
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}> = ({ activeTab, onChange }) => (
  <div className="app-settings-tabs">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        id={`tab-btn-${tab.id}`}
        className="app-settings-tab"
        onClick={() => onChange(tab.id)}
        style={{
          padding: "var(--spacing-sm)",
          border: "none",
          background: "none",
          borderBottom:
            activeTab === tab.id
              ? "2px solid var(--c-primary)"
              : "2px solid transparent",
          color:
            activeTab === tab.id ? "var(--c-primary)" : "var(--c-text-sub)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          fontWeight: 700,
          transition: "var(--transition-fast)",
        }}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

const TabContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="app-settings-tab-body">
    <h2
      className="text-title2"
      style={{ marginBottom: "var(--spacing-md)", flexShrink: 0 }}
    >
      {title}
    </h2>
    {children}
  </div>
);

const SettingsContent: React.FC<{ activeTab: Tab }> = ({ activeTab }) => {
  return (
    <div
      id="settings-content-area"
      className="app-settings-content"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "var(--spacing-md)",
      }}
    >
      {activeTab === "students" && (
        <TabContainer title="生徒設定">
          <StudentTab />
        </TabContainer>
      )}
      {activeTab === "roles" && (
        <TabContainer title="役割設定">
          <RoleTab />
        </TabContainer>
      )}
      {activeTab === "groups" && (
        <TabContainer title="グループ設定">
          <GroupTab />
        </TabContainer>
      )}
      {activeTab === "constraints" && (
        <TabContainer title="条件設定">
          <ConstraintTab />
        </TabContainer>
      )}
      {activeTab === "global" && (
        <TabContainer title="全体設定">
          <GlobalTab />
        </TabContainer>
      )}
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const activeTab = useStore((state) => state.activeSettingsTab);
  const setActiveTab = useStore((state) => state.setActiveSettingsTab);

  return (
    <div
      id="settings-main-area"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--c-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />
      <SettingsContent activeTab={activeTab} />
    </div>
  );
};

export default SettingsPanel;
