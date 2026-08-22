export type TaskCategory = 'academic' | 'personal' | 'admin';
export type TaskPriority = 'urgent' | 'important' | 'can-wait';
export type TaskStatus = 'todo' | 'done';

export interface GahaTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  date: string;
  status: TaskStatus;
  carryForwardCount: number;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function createTask(
  title: string,
  category: TaskCategory = 'personal',
  priority: TaskPriority = 'can-wait',
  date: string = new Date().toISOString().split('T')[0]
): GahaTask {
  return {
    id: generateId(),
    title,
    category,
    priority,
    date,
    status: 'todo',
    carryForwardCount: 0,
  };
}

export function completeTask(task: GahaTask): GahaTask {
  return { ...task, status: 'done' };
}

export function carryForwardTask(task: GahaTask): GahaTask {
  const nextDate = new Date(task.date);
  nextDate.setDate(nextDate.getDate() + 1);
  return {
    ...task,
    date: nextDate.toISOString().split('T')[0],
    carryForwardCount: task.carryForwardCount + 1,
  };
}
