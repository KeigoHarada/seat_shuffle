import React, { useState, useEffect } from 'react';
import type { ShuffleAnimation } from '../../utils/shuffleAnimations';
import type { Seat, Student, Group, Role, Condition } from '../../types';
import { RandomShuffleAlgorithm } from '../../algorithms/RandomShuffleAlgorithm';
import { UI_CONSTANTS } from '../../constants/ui';

interface ShufflingNameProps {
  seatId: string;
  originalName: string | null;
  originalFurigana?: string;
  allStudents: Array<{ id: string; name: string; furigana?: string }>;
  shuffleAnimation: ShuffleAnimation;
  isShuffling: boolean;
  scale: number;
  students: Student[];
  seats: Seat[];
  conditions: Condition[];
  groups: Group[];
  roles: Role[];
}

export const ShufflingName: React.FC<ShufflingNameProps> = ({
  seatId,
  originalName,
  originalFurigana,
  allStudents,
  shuffleAnimation,
  isShuffling,
  scale,
  students,
  seats,
  conditions,
  groups,
  roles,
}) => {
  const randomAlgorithm = React.useMemo(() => new RandomShuffleAlgorithm(), []);
  const [shufflingName, setShufflingName] = useState<string | null>(originalName);
  const [shufflingFurigana, setShufflingFurigana] = useState<string | undefined>(originalFurigana);

  useEffect(() => {
    if (!isShuffling) {
      setShufflingName(originalName);
      setShufflingFurigana(originalFurigana);
      return;
    }

    if (shuffleAnimation.getShufflingAssignment) {
      const interval = setInterval(async () => {
        try {
          const assignment = await shuffleAnimation.getShufflingAssignment!(
            students,
            seats,
            conditions,
            groups,
            roles,
            randomAlgorithm,
          );
          
          const assignedStudentId = assignment[seatId];
          if (assignedStudentId) {
            const student = students.find(s => s.id === assignedStudentId);
            if (student) {
              setShufflingName(student.name);
              setShufflingFurigana(student.furigana);
            } else {
              setShufflingName(originalName);
              setShufflingFurigana(originalFurigana);
            }
          } else {
            setShufflingName(null);
            setShufflingFurigana(undefined);
          }
        } catch (error) {
          console.error('シャッフルアニメーションエラー:', error);
          setShufflingName(originalName);
          setShufflingFurigana(originalFurigana);
        }
      }, 100);

      return () => clearInterval(interval);
    } else if (shuffleAnimation.getShufflingName) {
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
  }, [isShuffling, seatId, originalName, originalFurigana, allStudents, shuffleAnimation, students, seats, conditions, groups, roles, randomAlgorithm]);

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
