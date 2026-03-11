export type Priority = 'p0' | 'p1' | 'p2' | 'p3';

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; dotColor: string; order: number }> = {
  p0: { label: 'Urgent', color: 'text-priority-p0', bgColor: 'bg-red-500/10', dotColor: 'bg-priority-p0', order: 0 },
  p1: { label: 'High', color: 'text-priority-p1', bgColor: 'bg-amber-500/10', dotColor: 'bg-priority-p1', order: 1 },
  p2: { label: 'Medium', color: 'text-priority-p2', bgColor: 'bg-blue-500/10', dotColor: 'bg-priority-p2', order: 2 },
  p3: { label: 'Low', color: 'text-priority-p3', bgColor: 'bg-gray-500/10', dotColor: 'bg-priority-p3', order: 3 },
};

export function getPriorityConfig(priority: Priority) {
  return PRIORITY_CONFIG[priority];
}

export function sortByPriority<T extends { priority: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order);
}
