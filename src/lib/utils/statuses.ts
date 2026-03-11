export type TaskStatus = 'inbox' | 'planned' | 'in_progress' | 'waiting' | 'blocked' | 'done';

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string; icon: string; order: number }> = {
  inbox: { label: 'Inbox', color: 'text-status-neutral', bgColor: 'bg-gray-500/10', icon: 'inbox', order: 0 },
  planned: { label: 'Planned', color: 'text-status-info', bgColor: 'bg-blue-500/10', icon: 'circle-dot', order: 1 },
  in_progress: { label: 'In Progress', color: 'text-status-info', bgColor: 'bg-blue-500/10', icon: 'play', order: 2 },
  waiting: { label: 'Waiting', color: 'text-status-warning', bgColor: 'bg-yellow-500/10', icon: 'clock', order: 3 },
  blocked: { label: 'Blocked', color: 'text-status-danger', bgColor: 'bg-red-500/10', icon: 'octagon', order: 4 },
  done: { label: 'Done', color: 'text-status-success', bgColor: 'bg-green-500/10', icon: 'check-circle', order: 5 },
};

export const KANBAN_COLUMNS: TaskStatus[] = ['inbox', 'planned', 'in_progress', 'waiting', 'blocked', 'done'];

export function getStatusConfig(status: TaskStatus) {
  return STATUS_CONFIG[status];
}
