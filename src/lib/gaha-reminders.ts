import { differenceInDays, differenceInHours } from 'date-fns';

export type ReminderType = 'academic' | 'personal';
export type ReminderStatus = 'pending' | 'completed';
export type EscalationLevel = 'normal' | 'warning' | 'urgent';
export type PriorityLevel = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  title: string;
  dueDate: Date | string;
  priority: PriorityLevel;
  type: ReminderType;
  status: ReminderStatus;
}

export function calculateEscalation(dueDate: Date | string): EscalationLevel {
  const due = new Date(dueDate);
  const now = new Date();
  
  const daysDiff = differenceInDays(due, now);
  const hoursDiff = differenceInHours(due, now);

  if (hoursDiff < 24) {
    return 'urgent';
  } else if (daysDiff <= 3) {
    return 'warning';
  }
  return 'normal';
}
