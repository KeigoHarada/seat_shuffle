import { AppState } from "../types";
import type { GenderType } from "../types";

export function exportSettingsToCSV(state: AppState): string {
  const lines: string[] = [];

  const roleIdToName = Object.fromEntries(
    state.roles.map((r) => [r.id, r.name]),
  );
  const groupIdToName = Object.fromEntries(
    state.groups.map((g) => [g.id, g.name]),
  );
  const studentIdToName = Object.fromEntries(
    state.students.map((s) => [s.id, s.name]),
  );

  lines.push("# Students");
  lines.push("attendanceNumber,name,furigana,gender,roles");
  state.students.forEach((s) => {
    const roleNames = s.roleIds
      .map((id) => roleIdToName[id] || "")
      .filter(Boolean);
    lines.push(
      [
        s.attendanceNumber,
        s.name,
        s.furigana || "",
        s.gender,
        roleNames.join("|"),
      ].join(","),
    );
  });
  lines.push("");

  lines.push("# Roles");
  lines.push("name,iconName,description");
  state.roles.forEach((r) => {
    lines.push([r.name, r.iconName, r.description || ""].join(","));
  });
  lines.push("");

  lines.push("# Groups");
  lines.push("name,color,description");
  state.groups.forEach((g) => {
    lines.push([g.name, g.color, g.description || ""].join(","));
  });
  lines.push("");

  lines.push("# Constraints");
  lines.push("type,isEnabled,json_data");
  state.constraints.forEach((c) => {
    const { id, type, isEnabled, ...rest } = c;
    const readableData: any = { ...rest };

    if (readableData.studentId1)
      readableData.studentName1 = studentIdToName[readableData.studentId1];
    if (readableData.studentId2)
      readableData.studentName2 = studentIdToName[readableData.studentId2];
    if (readableData.studentId)
      readableData.studentName = studentIdToName[readableData.studentId];
    if (readableData.groupIds)
      readableData.groupNames = readableData.groupIds.map(
        (gId: string) => groupIdToName[gId],
      );
    if (readableData.targetId && readableData.targetType === "role")
      readableData.targetName = roleIdToName[readableData.targetId];
    if (readableData.targetId && readableData.targetType === "gender")
      readableData.targetName = readableData.targetId;

    delete readableData.studentId1;
    delete readableData.studentId2;
    delete readableData.studentId;
    delete readableData.groupIds;
    delete readableData.targetId;

    const jsonStr = JSON.stringify(readableData).replace(/"/g, '""');
    lines.push([type, isEnabled ? "true" : "false", `"${jsonStr}"`].join(","));
  });

  return lines.join("\n");
}

export function importSettingsFromCSV(csv: string): Partial<AppState> {
  const state: Partial<AppState> = {
    students: [],
    roles: [],
    groups: [],
    constraints: [],
  };

  const lines = csv.split(/\r?\n/).map((l) => l.trim());
  let currentSection = "";

  const rawStudents: any[] = [];
  const rawConstraints: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    if (line.startsWith("# ")) {
      currentSection = line.substring(2).trim().toLowerCase();
      i++;
      continue;
    }

    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleanCol = (c: string) =>
      (c || "").replace(/^"|"$/g, "").replace(/""/g, '"');

    try {
      if (currentSection === "students") {
        rawStudents.push({
          attendanceNumber: parseInt(cleanCol(cols[0]), 10) || 0,
          name: cleanCol(cols[1]),
          furigana: cleanCol(cols[2]),
          gender: cleanCol(cols[3]) as GenderType,
          roleNames: cols[4]
            ? cleanCol(cols[4]).split("|").filter(Boolean)
            : [],
        });
      } else if (currentSection === "roles") {
        state.roles!.push({
          id: crypto.randomUUID(),
          name: cleanCol(cols[0]),
          iconName: cleanCol(cols[1]),
          description: cleanCol(cols[2]),
        });
      } else if (currentSection === "groups") {
        state.groups!.push({
          id: crypto.randomUUID(),
          name: cleanCol(cols[0]),
          color: cleanCol(cols[1]),
          description: cleanCol(cols[2]),
        });
      } else if (currentSection === "constraints") {
        rawConstraints.push({
          type: cleanCol(cols[0]),
          isEnabled: cleanCol(cols[1]) === "true",
          data: JSON.parse(cleanCol(cols[2])),
        });
      }
    } catch (e) {
      console.warn("Skipped invalid row", line, e);
    }
  }

  const roleNameToId = Object.fromEntries(
    state.roles!.map((r) => [r.name, r.id]),
  );
  const groupNameToId = Object.fromEntries(
    state.groups!.map((g) => [g.name, g.id]),
  );

  rawStudents.forEach((rs) => {
    const roleIds = rs.roleNames
      .map((rn: string) => {
        if (!roleNameToId[rn]) {
          const newRole = {
            id: crypto.randomUUID(),
            name: rn,
            iconName: "User",
          };
          state.roles!.push(newRole);
          roleNameToId[rn] = newRole.id;
        }
        return roleNameToId[rn];
      })
      .filter(Boolean);

    state.students!.push({
      id: crypto.randomUUID(),
      attendanceNumber: rs.attendanceNumber || state.students!.length + 1,
      name: rs.name,
      furigana: rs.furigana,
      gender: rs.gender,
      roleIds,
    });
  });

  const studentNameToId = Object.fromEntries(
    state.students!.map((s) => [s.name, s.id]),
  );

  rawConstraints.forEach((rc) => {
    const resolvedData: any = {};
    if (rc.data.studentName1)
      resolvedData.studentId1 = studentNameToId[rc.data.studentName1];
    if (rc.data.studentName2)
      resolvedData.studentId2 = studentNameToId[rc.data.studentName2];
    if (rc.data.studentName)
      resolvedData.studentId = studentNameToId[rc.data.studentName];
    if (rc.data.groupNames)
      resolvedData.groupIds = rc.data.groupNames
        .map((gn: string) => groupNameToId[gn])
        .filter(Boolean);

    if (rc.data.targetName) {
      if (rc.type === "group-match") {
        if (rc.data.targetType === "role") {
          resolvedData.targetId = roleNameToId[rc.data.targetName];
        } else {
          resolvedData.targetId = rc.data.targetName;
        }
      }
    }

    Object.keys(rc.data).forEach((k) => {
      if (!k.endsWith("Name") && !k.endsWith("Names")) {
        resolvedData[k] = rc.data[k];
      }
    });

    state.constraints!.push({
      id: crypto.randomUUID(),
      type: rc.type,
      isEnabled: rc.isEnabled,
      ...resolvedData,
    });
  });

  return state;
}
