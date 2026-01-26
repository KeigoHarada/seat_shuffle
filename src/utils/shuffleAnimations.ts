import React from "react";
import type { Seat, Student, Group, Role, Condition } from "../types";
import type { ShuffleAlgorithm } from "../types/shuffle";

export interface ShuffleAnimation {
  name: string;
  duration: number;
  renderOverlay?: () => React.ReactNode;
  getShufflingName?: (
    seatId: string,
    originalName: string | null,
    allStudents: Array<{ id: string; name: string; furigana?: string }>,
    elapsedTime: number,
    totalDuration: number,
  ) => string | null;
  getShufflingAssignment?: (
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[],
    algorithm: ShuffleAlgorithm,
  ) => Promise<{ [seatId: string]: string | undefined }>;
}

export class NameShuffleAnimation implements ShuffleAnimation {
  name = "name-shuffle";
  duration = 2000;

  async getShufflingAssignment(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[],
    algorithm: ShuffleAlgorithm,
  ): Promise<{ [seatId: string]: string | undefined }> {
    const result = await algorithm.shuffle(
      students,
      seats,
      conditions,
      groups,
      roles,
    );
    return result.success ? result.assignment : {};
  }
}

export class NameShuffleWithOverlayAnimation implements ShuffleAnimation {
  name = "name-shuffle-overlay";
  duration = 2000;

  async getShufflingAssignment(
    students: Student[],
    seats: Seat[],
    conditions: Condition[],
    groups: Group[],
    roles: Role[],
    algorithm: ShuffleAlgorithm,
  ): Promise<{ [seatId: string]: string | undefined }> {
    const result = await algorithm.shuffle(
      students,
      seats,
      conditions,
      groups,
      roles,
    );
    return result.success ? result.assignment : {};
  }

  renderOverlay(): React.ReactNode {
    // 例: <img src="/animations/majin-mixing.gif" alt="シャッフル中" />
    return null;
  }
}

export const SHUFFLE_ANIMATIONS: Record<string, ShuffleAnimation> = {
  "name-shuffle": new NameShuffleAnimation(),
  "name-shuffle-overlay": new NameShuffleWithOverlayAnimation(),
};

export const DEFAULT_SHUFFLE_ANIMATION = "name-shuffle";

// アニメーションを変更する場合は、この値を変更してください
// 利用可能なアニメーション: "name-shuffle", "name-shuffle-overlay"
export const CURRENT_SHUFFLE_ANIMATION = "name-shuffle";
