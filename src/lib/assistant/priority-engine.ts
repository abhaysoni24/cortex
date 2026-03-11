/**
 * Priority Engine
 *
 * Scores and ranks tasks based on multiple factors:
 * - Explicit priority (p0-p3)
 * - Due date proximity
 * - Blocker status
 * - Dependencies (blocking other tasks)
 * - Workstream importance
 * - Time decay (stale tasks get boosted)
 */

interface TaskForScoring {
  id: string;
  priority: 'p0' | 'p1' | 'p2' | 'p3';
  status: string;
  due_date: string | null;
  created_at: string;
  blocks_count: number;
}

interface ScoredTask extends TaskForScoring {
  score: number;
  factors: Record<string, number>;
}

const PRIORITY_WEIGHTS = { p0: 100, p1: 70, p2: 40, p3: 20 };

export function scoreTask(task: TaskForScoring): ScoredTask {
  const factors: Record<string, number> = {};

  // Priority weight
  factors.priority = PRIORITY_WEIGHTS[task.priority];

  // Due date urgency (higher score as deadline approaches)
  if (task.due_date) {
    const daysUntilDue = Math.ceil(
      (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue < 0) factors.overdue = 50 + Math.min(Math.abs(daysUntilDue) * 5, 50);
    else if (daysUntilDue === 0) factors.dueToday = 40;
    else if (daysUntilDue === 1) factors.dueTomorrow = 25;
    else if (daysUntilDue <= 3) factors.dueSoon = 15;
    else factors.dueDate = 5;
  }

  // Blocking multiplier
  if (task.blocks_count > 0) {
    factors.blocking = task.blocks_count * 15;
  }

  // Staleness (tasks sitting too long get a nudge)
  const daysOld = Math.ceil(
    (Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysOld > 14 && task.status !== 'done') {
    factors.stale = Math.min(daysOld - 14, 20);
  }

  const score = Object.values(factors).reduce((sum, v) => sum + v, 0);

  return { ...task, score, factors };
}

export function rankTasks(tasks: TaskForScoring[]): ScoredTask[] {
  return tasks.map(scoreTask).sort((a, b) => b.score - a.score);
}
