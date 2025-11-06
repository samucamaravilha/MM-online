import type { Json } from './database';

export type ScheduleDepartment = {
  id: string;
  name: string;
  lead?: string;
  status?: 'planejado' | 'em_andamento' | 'concluido';
};

export type ScheduleMilestone = {
  id: string;
  title: string;
  dueDate: string;
  owner?: string;
  status?: 'planejado' | 'em_andamento' | 'concluido';
};

export type ScheduleScene = {
  id: string;
  scene: string;
  location: string;
  shootDate: string;
  department?: string;
};

export type ProjectSchedule = {
  scenes: ScheduleScene[];
  milestones: ScheduleMilestone[];
  departments: ScheduleDepartment[];
};

export function isProjectSchedule(data: Json): data is ProjectSchedule {
  if (typeof data !== 'object' || data === null) return false;
  const maybe = data as Record<string, unknown>;
  return Array.isArray(maybe.scenes) && Array.isArray(maybe.milestones) && Array.isArray(maybe.departments);
}
