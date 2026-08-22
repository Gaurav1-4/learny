import { format, parse, addMinutes, differenceInMinutes, addDays, startOfWeek, isValid } from 'date-fns';
import { ClassSlot, TIMETABLE_CLASSES } from '@/lib/timetable-data';
import { getAcademicDateInfo } from '@/lib/academic-calendar-engine';

export type BlockType = 'class' | 'study' | 'personal' | 'social' | 'deadline';
export type DayName = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeBlock {
  id: string;
  label: string;
  type: BlockType;
  day: DayName;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm 24h
  endTime: string; // HH:mm 24h
  subject?: string; // for class/study blocks
  courseCode?: string;
  color: string; // tailwind border color class
  bgColor: string; // tailwind bg color class
  isFixed: boolean; // classes are fixed, personal blocks are not
  room?: string;
  notes?: string;
  conflictsWith?: string[]; // IDs of blocks this conflicts with
}

export interface ConflictInfo {
  newBlock: TimeBlock;
  conflictingBlocks: TimeBlock[];
  suggestedAlternatives: TimeBlock[]; // auto-rescheduled versions
}

export interface DaySchedule {
  date: string;
  dayName: DayName;
  blocks: TimeBlock[];
  totalStudyMinutes: number;
  totalPersonalMinutes: number;
  totalClassMinutes: number;
  isTTA: boolean;
  ttaTargetDay?: DayName;
  isHoliday: boolean;
  holidayName?: string;
}

export const QUICK_ADD_PRESETS = [
  { label: 'Going out with friends', icon: '🤝', defaultDuration: 180, type: 'social' as BlockType, color: 'border-orange-500/40 text-orange-300', bgColor: 'bg-orange-500/10' },
  { label: 'Gym / Sports', icon: '🏋️', defaultDuration: 60, type: 'personal' as BlockType, color: 'border-green-500/40 text-green-300', bgColor: 'bg-green-500/10' },
  { label: 'Family Time', icon: '👨👩👦', defaultDuration: 120, type: 'personal' as BlockType, color: 'border-pink-500/40 text-pink-300', bgColor: 'bg-pink-500/10' },
  { label: 'Netflix / Chill', icon: '🎬', defaultDuration: 120, type: 'personal' as BlockType, color: 'border-red-500/40 text-red-300', bgColor: 'bg-red-500/10' },
  { label: 'Meal / Break', icon: '🍕', defaultDuration: 45, type: 'personal' as BlockType, color: 'border-yellow-500/40 text-yellow-300', bgColor: 'bg-yellow-500/10' },
  { label: 'Study Session', icon: '📚', defaultDuration: 90, type: 'study' as BlockType, color: 'border-blue-500/40 text-blue-300', bgColor: 'bg-blue-500/10' },
];

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getBlockDuration(block: TimeBlock): number {
  return timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
}

export function doBlocksOverlap(a: TimeBlock, b: TimeBlock): boolean {
  if (a.date !== b.date) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function classSlotToTimeBlock(slot: ClassSlot, date: string): TimeBlock {
  const dayName = format(new Date(date), 'EEEE') as DayName;
  return {
    id: `class-${slot.id}-${date}`,
    label: slot.subject,
    type: 'class',
    day: dayName,
    date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    subject: slot.subject,
    courseCode: slot.code,
    color: slot.color,
    bgColor: slot.bgLight,
    isFixed: true,
    room: slot.room,
    notes: slot.notes
  };
}

export function getClassBlocksForDate(date: Date): TimeBlock[] {
  const academicInfo = getAcademicDateInfo(date);
  if (!academicInfo.effectiveClasses) return [];
  
  return academicInfo.effectiveClasses.map(slot => classSlotToTimeBlock(slot, format(date, 'yyyy-MM-dd')));
}

const COURSES = [
  { name: 'Math III', code: 'MTH201' },
  { name: 'OS', code: 'CSE231' },
  { name: 'AP', code: 'CSE201' },
  { name: 'RMSSD', code: 'SSH201' },
  { name: 'DPP', code: 'DES201' }
];
let roundRobinIndex = 0;

export function generateDefaultStudyBlocks(date: Date, existingPersonalBlocks: TimeBlock[]): TimeBlock[] {
  const academicInfo = getAcademicDateInfo(date);
  if (academicInfo.phase !== 'REGULAR' || academicInfo.isHoliday || academicInfo.isExamWeek) {
    return [];
  }

  const dateStr = format(date, 'yyyy-MM-dd');
  const dayName = format(date, 'EEEE') as DayName;
  const classBlocks = getClassBlocksForDate(date);
  
  const allBlocks = [...classBlocks, ...existingPersonalBlocks.filter(b => b.date === dateStr)];
  allBlocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const startOfDayMinutes = timeToMinutes('08:00');
  const endOfDayMinutes = timeToMinutes('22:00');
  
  let currentTime = startOfDayMinutes;
  const studyBlocks: TimeBlock[] = [];

  for (const block of allBlocks) {
    if (studyBlocks.length >= 4) break;
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);

    if (blockStart - currentTime >= 45) {
      const course = COURSES[roundRobinIndex % COURSES.length];
      roundRobinIndex++;
      
      const duration = Math.min(90, blockStart - currentTime);
      studyBlocks.push({
        id: `study-auto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
        label: `Study: ${course.name}`,
        type: 'study',
        day: dayName,
        date: dateStr,
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(currentTime + duration),
        subject: course.name,
        courseCode: course.code,
        color: 'border-blue-500/40 text-blue-300',
        bgColor: 'bg-blue-500/10',
        isFixed: false
      });
    }
    currentTime = Math.max(currentTime, blockEnd);
  }

  if (studyBlocks.length < 4 && endOfDayMinutes - currentTime >= 45) {
    const course = COURSES[roundRobinIndex % COURSES.length];
    roundRobinIndex++;
    const duration = Math.min(90, endOfDayMinutes - currentTime);
    studyBlocks.push({
      id: `study-auto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
      label: `Study: ${course.name}`,
      type: 'study',
      day: dayName,
      date: dateStr,
      startTime: minutesToTime(currentTime),
      endTime: minutesToTime(currentTime + duration),
      subject: course.name,
      courseCode: course.code,
      color: 'border-blue-500/40 text-blue-300',
      bgColor: 'bg-blue-500/10',
      isFixed: false
    });
  }

  return studyBlocks;
}

export function detectConflicts(newBlock: TimeBlock, existingBlocks: TimeBlock[]): ConflictInfo | null {
  const conflicts = existingBlocks.filter(b => doBlocksOverlap(newBlock, b));
  if (conflicts.length === 0) return null;

  return {
    newBlock,
    conflictingBlocks: conflicts,
    suggestedAlternatives: findBestAlternativeSlot(newBlock, existingBlocks, existingBlocks) // Simplified
  };
}

export function findBestAlternativeSlot(block: TimeBlock, dayBlocks: TimeBlock[], weekBlocks: TimeBlock[]): TimeBlock[] {
  const duration = getBlockDuration(block);
  const alternatives: TimeBlock[] = [];
  const startOfDay = timeToMinutes('08:00');
  const endOfDay = timeToMinutes('22:00');
  const allBlocks = [...dayBlocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Try later in the day
  let currentTime = timeToMinutes(block.endTime);
  for (let i = 0; i < allBlocks.length; i++) {
     const nextBlock = allBlocks[i];
     if (timeToMinutes(nextBlock.startTime) - currentTime >= duration) {
       if (currentTime + duration <= endOfDay) {
          alternatives.push({
            ...block,
            id: `alt-${Date.now()}-1`,
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(currentTime + duration)
          });
          break;
       }
     }
     currentTime = Math.max(currentTime, timeToMinutes(nextBlock.endTime));
  }
  
  if (alternatives.length === 0 && endOfDay - currentTime >= duration) {
     alternatives.push({
        ...block,
        id: `alt-${Date.now()}-1`,
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(currentTime + duration)
     });
  }

  // Try earlier in the day
  currentTime = startOfDay;
  for (let i = 0; i < allBlocks.length; i++) {
     const nextBlock = allBlocks[i];
     if (timeToMinutes(nextBlock.startTime) - currentTime >= duration) {
        if (currentTime + duration <= timeToMinutes(block.startTime)) {
          alternatives.push({
            ...block,
            id: `alt-${Date.now()}-2`,
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(currentTime + duration)
          });
          break;
        }
     }
     currentTime = Math.max(currentTime, timeToMinutes(nextBlock.endTime));
  }
  
  return alternatives.slice(0, 3);
}

export function buildDaySchedule(date: Date, personalBlocks: TimeBlock[]): DaySchedule {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayName = format(date, 'EEEE') as DayName;
  const classBlocks = getClassBlocksForDate(date);
  const studyBlocks = generateDefaultStudyBlocks(date, personalBlocks);
  const dailyPersonalBlocks = personalBlocks.filter(b => b.date === dateStr);

  const allBlocks = [...classBlocks, ...studyBlocks, ...dailyPersonalBlocks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  let totalStudyMinutes = 0;
  let totalPersonalMinutes = 0;
  let totalClassMinutes = 0;

  for (const block of allBlocks) {
    const duration = getBlockDuration(block);
    if (block.type === 'study') totalStudyMinutes += duration;
    else if (block.type === 'class') totalClassMinutes += duration;
    else totalPersonalMinutes += duration;
  }

  const academicInfo = getAcademicDateInfo(date);

  return {
    date: dateStr,
    dayName,
    blocks: allBlocks,
    totalStudyMinutes,
    totalPersonalMinutes,
    totalClassMinutes,
    isTTA: academicInfo.isTTA || false,
    ttaTargetDay: academicInfo.ttaTargetDay as DayName,
    isHoliday: academicInfo.isHoliday || false,
    holidayName: academicInfo.holidayName
  };
}

export function buildWeekSchedule(startDate: Date, personalBlocks: TimeBlock[]): DaySchedule[] {
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
  const schedule: DaySchedule[] = [];
  for (let i = 0; i < 7; i++) {
    schedule.push(buildDaySchedule(addDays(weekStart, i), personalBlocks));
  }
  return schedule;
}

export function loadPersonalBlocks(): TimeBlock[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('gaha-personal-blocks');
  return stored ? JSON.parse(stored) : [];
}

export function savePersonalBlocks(blocks: TimeBlock[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('gaha-personal-blocks', JSON.stringify(blocks));
}

export function addPersonalBlock(block: TimeBlock): ConflictInfo | null {
  const existing = loadPersonalBlocks();
  const classBlocks = getClassBlocksForDate(new Date(block.date));
  const conflicts = detectConflicts(block, [...existing, ...classBlocks]);
  
  if (conflicts) return conflicts;
  
  existing.push(block);
  savePersonalBlocks(existing);
  return null;
}

export function removePersonalBlock(blockId: string): void {
  const existing = loadPersonalBlocks();
  savePersonalBlocks(existing.filter(b => b.id !== blockId));
}

export function moveBlock(blockId: string, newStartTime: string, newEndTime: string): ConflictInfo | null {
  const existing = loadPersonalBlocks();
  const blockIndex = existing.findIndex(b => b.id === blockId);
  if (blockIndex === -1) return null;
  
  const block = { ...existing[blockIndex], startTime: newStartTime, endTime: newEndTime };
  const otherBlocks = existing.filter(b => b.id !== blockId);
  const classBlocks = getClassBlocksForDate(new Date(block.date));
  
  const conflicts = detectConflicts(block, [...otherBlocks, ...classBlocks]);
  if (conflicts) return conflicts;
  
  existing[blockIndex] = block;
  savePersonalBlocks(existing);
  return null;
}
