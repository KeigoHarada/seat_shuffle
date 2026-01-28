import React, { useState, useEffect } from 'react';
import type { ShuffleAnimation } from '../../utils/shuffleAnimations';
import { UI_CONSTANTS } from '../../constants/ui';

interface ShufflingNameProps {
  seatId: string;
  originalName: string | null;
  originalFurigana?: string;
  allStudents: Array<{ id: string; name: string; furigana?: string }>;
  shuffleAnimation: ShuffleAnimation;
  isShuffling: boolean;
  scale: number;
}

export const ShufflingName: React.FC<ShufflingNameProps> = ({
  seatId,
  originalName,
  originalFurigana,
  allStudents,
  shuffleAnimation,
  isShuffling,
  scale,
}) => {
  const [shufflingName, setShufflingName] = useState<string | null>(originalName);
  const [shufflingFurigana, setShufflingFurigana] = useState<string | undefined>(originalFurigana);

  useEffect(() => {
    if (!isShuffling) {
      setShufflingName(originalName);
      setShufflingFurigana(originalFurigana);
      return;
    }

    if (shuffleAnimation.getShufflingName) {
      const interval = setInterval(() => {
        const startTime = (window as any).__shuffleStartTime || Date.now();
        const elapsedTime = Date.now() - startTime;
        const newName = shuffleAnimation.getShufflingName!(
          seatId,
          originalName,
          allStudents,
          elapsedTime,
          shuffleAnimation.duration,
        );
        setShufflingName(newName);
        
        if (newName) {
          const student = allStudents.find(s => s.name === newName);
          setShufflingFurigana(student?.furigana);
        } else {
          setShufflingFurigana(originalFurigana);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isShuffling, seatId, originalName, originalFurigana, allStudents, shuffleAnimation]);

  if (originalFurigana || shufflingFurigana) {
    return (
      <>
        <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.TINY * scale}px`, color: 'var(--color-secondary-500)', lineHeight: '1.2' }}>
          {shufflingFurigana || originalFurigana}
        </span>
        <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`, fontWeight: '600', lineHeight: '1.2' }}>
          {shufflingName || originalName}
        </span>
      </>
    );
  }

  return (
    <span style={{ fontSize: `${UI_CONSTANTS.FONT_SIZE.LARGE * scale}px`, fontWeight: '600', lineHeight: '1.2' }}>
      {shufflingName || originalName}
    </span>
  );
};
