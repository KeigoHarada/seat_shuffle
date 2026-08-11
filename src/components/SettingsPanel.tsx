import React, { useState } from "react";
import {
  Users,
  UserCircle,
  UsersRound,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import StudentTab from "./settings/student/StudentTab";
import RoleList from "./RoleList";
import GroupList from "./GroupList";

type Tab = "students" | "roles" | "groups" | "constraints" | "global";

const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "students", label: "生徒", icon: <Users size={16} /> },
    { id: "roles", label: "役割", icon: <UserCircle size={16} /> },
    { id: "groups", label: "グループ", icon: <UsersRound size={16} /> },
    { id: "constraints", label: "条件", icon: <ShieldCheck size={16} /> },
    { id: "global", label: "設定", icon: <Settings2 size={16} /> },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "var(--c-surface)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--c-border)",
          paddingTop: "var(--spacing-xs)",
          position: "relative",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
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

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-lg)" }}>
        {activeTab === "students" && (
          <div>
            <h2
              className="text-title2"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              生徒一覧
            </h2>
            <StudentTab />
          </div>
        )}
        {activeTab === "roles" && (
          <div>
            <h2
              className="text-title2"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              役割設定
            </h2>
            <RoleList />
          </div>
        )}
        {activeTab === "groups" && (
          <div>
            <h2
              className="text-title2"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              グループ設定
            </h2>
            <GroupList />
          </div>
        )}
        {activeTab === "constraints" && (
          <div>
            <h2
              className="text-title2"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              条件設定
            </h2>
            <div
              className="card"
              style={{
                padding: "var(--spacing-lg)",
                textAlign: "center",
                color: "var(--c-text-sub)",
              }}
            >
              開発中です
            </div>
          </div>
        )}
        {activeTab === "global" && (
          <div>
            <h2
              className="text-title2"
              style={{ marginBottom: "var(--spacing-md)" }}
            >
              全体設定
            </h2>
            <div
              className="card"
              style={{
                padding: "var(--spacing-lg)",
                textAlign: "center",
                color: "var(--c-text-sub)",
              }}
            >
              開発中です
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
