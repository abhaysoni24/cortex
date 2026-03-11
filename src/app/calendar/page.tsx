'use client';

import {
  Calendar,
  Users,
  FileText,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

interface TimelineEvent {
  id: string;
  type: 'meeting' | 'task';
  time: string;
  endTime?: string;
  title: string;
  color: string;
  attendees?: number;
  priority?: 'p0' | 'p1' | 'p2' | 'p3';
  done?: boolean;
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 'e1',
    type: 'meeting',
    time: '9:00 AM',
    endTime: '9:15 AM',
    title: 'Daily standup',
    color: 'border-l-status-info',
    attendees: 6,
  },
  {
    id: 'e2',
    type: 'task',
    time: '9:30 AM',
    title: 'Review GA4 funnel drop-off analysis',
    color: 'border-l-priority-p0',
    priority: 'p0',
  },
  {
    id: 'e3',
    type: 'meeting',
    time: '10:00 AM',
    endTime: '10:45 AM',
    title: 'Growth strategy sync',
    color: 'border-l-status-success',
    attendees: 4,
  },
  {
    id: 'e4',
    type: 'task',
    time: '11:00 AM',
    title: 'Ship onboarding flow v2 — final QA',
    color: 'border-l-priority-p0',
    priority: 'p0',
  },
  {
    id: 'e5',
    type: 'task',
    time: '11:30 AM',
    title: 'Update pricing page copy',
    color: 'border-l-priority-p1',
    priority: 'p1',
  },
  {
    id: 'e6',
    type: 'meeting',
    time: '2:00 PM',
    endTime: '2:30 PM',
    title: '1:1 with Sarah (Eng)',
    color: 'border-l-accent-500',
    attendees: 2,
  },
  {
    id: 'e7',
    type: 'task',
    time: '3:00 PM',
    title: 'Prepare board deck slides',
    color: 'border-l-priority-p1',
    priority: 'p1',
  },
  {
    id: 'e8',
    type: 'meeting',
    time: '3:30 PM',
    endTime: '4:30 PM',
    title: 'Product review',
    color: 'border-l-purple-500',
    attendees: 8,
  },
  {
    id: 'e9',
    type: 'task',
    time: '5:00 PM',
    title: 'Write Q1 growth retrospective',
    color: 'border-l-priority-p1',
    priority: 'p1',
    done: true,
  },
];

const priorityDotColor: Record<string, string> = {
  p0: 'bg-priority-p0',
  p1: 'bg-priority-p1',
  p2: 'bg-priority-p2',
  p3: 'bg-priority-p3',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent-500" />
          <h1 className="text-lg font-semibold text-text-primary">Today&apos;s Agenda</h1>
        </div>
        <p className="text-sm text-text-secondary">Wednesday, March 11, 2026</p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-1">
          {timelineEvents.map((event) => (
            <div key={event.id} className="flex gap-4">
              {/* Time column */}
              <div className="w-20 shrink-0 pt-3 text-right">
                <span className="font-mono text-xs text-text-tertiary">{event.time}</span>
              </div>

              {/* Connector dot */}
              <div className="relative flex flex-col items-center">
                <div className="mt-4 h-2 w-2 rounded-full bg-border-default" />
                <div className="flex-1 w-px bg-border-subtle" />
              </div>

              {/* Event card */}
              <div
                className={cn(
                  'mb-2 flex-1 rounded-md border border-border-subtle border-l-2 bg-bg-surface p-3 transition-colors hover:bg-bg-elevated cursor-pointer',
                  event.color
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {event.type === 'task' && event.priority && (
                      <span
                        className={cn(
                          'mt-1 h-2 w-2 shrink-0 rounded-full',
                          priorityDotColor[event.priority]
                        )}
                      />
                    )}
                    {event.type === 'task' && (
                      <CheckSquare
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          event.done ? 'text-status-success' : 'text-text-tertiary'
                        )}
                      />
                    )}
                    <div>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          event.done
                            ? 'text-text-tertiary line-through'
                            : 'text-text-primary'
                        )}
                      >
                        {event.title}
                      </p>
                      {event.endTime && (
                        <p className="mt-0.5 text-xs text-text-tertiary">
                          {event.time} - {event.endTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {event.attendees && (
                    <div className="flex items-center gap-1 text-xs text-text-tertiary">
                      <Users className="h-3 w-3" />
                      {event.attendees}
                    </div>
                  )}
                </div>

                {/* Action buttons for meetings */}
                {event.type === 'meeting' && (
                  <div className="mt-2 flex gap-1">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-3 w-3" />
                      Prep
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-3 w-3" />
                      Follow-up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* End of day marker */}
          <div className="flex gap-4">
            <div className="w-20 shrink-0 pt-3 text-right">
              <span className="font-mono text-xs text-text-tertiary">6:00 PM</span>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="mt-4 h-2 w-2 rounded-full bg-text-tertiary" />
            </div>
            <div className="mb-2 flex-1 pt-3">
              <p className="text-xs text-text-tertiary">End of day</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
