import React from "react";

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
}

export class NameShuffleAnimation implements ShuffleAnimation {
  name = "name-shuffle";
  duration = 2000;

  getShufflingName(
    _seatId: string,
    _originalName: string | null,
    allStudents: Array<{ id: string; name: string; furigana?: string }>,
    _elapsedTime: number,
    _totalDuration: number,
  ): string | null {
    if (allStudents.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * allStudents.length);
    return allStudents[randomIndex]?.name || null;
  }
}

export class NameShuffleWithOverlayAnimation implements ShuffleAnimation {
  name = "name-shuffle-overlay";
  duration = 2000;

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
