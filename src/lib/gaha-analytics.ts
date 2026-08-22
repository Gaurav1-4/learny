// src/lib/gaha-analytics.ts

export type StudyStreak = {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
};

export type ExamWarRoomConfig = {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  targetHoursPerDay: number;
};

export type HolidayPlanConfig = {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  autoRescheduleMissed: boolean;
};

export type SubjectBalance = {
  subject: string;
  totalHours: number;
  targetHours: number;
};

export function calculateStudyStreak(studyDates: string[]): StudyStreak {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: null,
  };
}

export function generateHeatmapData(days: number = 30) {
  // Empty state heatmap
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      intensity: 0,
    });
  }
  
  return data;
}

export function getSubjectBalance(): SubjectBalance[] {
  return [
    { subject: 'OS', totalHours: 0, targetHours: 30 },
    { subject: 'AP', totalHours: 0, targetHours: 25 },
    { subject: 'MTH201', totalHours: 0, targetHours: 40 },
    { subject: 'RMSSD', totalHours: 0, targetHours: 20 },
    { subject: 'DPP', totalHours: 0, targetHours: 15 },
  ];
}
