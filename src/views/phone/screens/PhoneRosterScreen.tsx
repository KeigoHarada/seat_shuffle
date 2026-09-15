import React, { useState } from "react";
import StudentTab from "../../../components/settings/student/StudentTab";
import RoleTab from "../../../components/settings/role/RoleTab";
import GroupTab from "../../../components/settings/group/GroupTab";
import {
  assertUnhandledRosterPage,
  type RosterPage,
} from "../../../layout/shell";

const ROSTER_PAGES: { id: RosterPage; label: string }[] = [
  { id: "students", label: "生徒" },
  { id: "roles", label: "役割" },
  { id: "groups", label: "グループ" },
];

const PhoneRosterScreen: React.FC = () => {
  const [page, setPage] = useState<RosterPage>("students");

  let body: React.ReactNode;
  switch (page) {
    case "students":
      body = <StudentTab />;
      break;
    case "roles":
      body = <RoleTab />;
      break;
    case "groups":
      body = <GroupTab />;
      break;
    default:
      return assertUnhandledRosterPage(page);
  }

  return (
    <div className="phone-screen">
      <div className="phone-roster-switch" role="tablist" aria-label="名簿">
        {ROSTER_PAGES.map((item) => (
          <button
            key={item.id}
            id={`tab-phone-roster-${item.id}`}
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
      <div className="phone-screen-body">{body}</div>
    </div>
  );
};

export default PhoneRosterScreen;
