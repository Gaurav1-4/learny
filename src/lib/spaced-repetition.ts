export interface SpacedRepetitionResult {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: string;
  isDue: boolean;
}

/**
 * SuperMemo SM-2 Algorithm
 * @param grade 0-5 (0=Again, 3=Hard, 4=Good, 5=Easy)
 * @param repetitions Number of times successfully reviewed (0 if failed)
 * @param easeFactor Initial 2.5
 * @param interval Days until next review
 */
export function calculateSM2(
  grade: number,
  repetitions: number = 0,
  easeFactor: number = 2.5,
  interval: number = 1
): SpacedRepetitionResult {
  // Update ease factor
  let nextEaseFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (nextEaseFactor < 1.3) {
    nextEaseFactor = 1.3;
  }

  let nextRepetitions = repetitions;
  let nextInterval = interval;

  if (grade < 3) {
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    nextRepetitions += 1;
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
  }

  const today = new Date();
  const nextDate = new Date(today.getTime() + nextInterval * 24 * 60 * 60 * 1000);
  
  return {
    repetitions: nextRepetitions,
    easeFactor: nextEaseFactor,
    interval: nextInterval,
    nextReviewDate: nextDate.toISOString().split('T')[0],
    isDue: false // will be checked when comparing nextReviewDate with today
  };
}

export function isDue(nextReviewDate?: string): boolean {
  if (!nextReviewDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return nextReviewDate <= today;
}
