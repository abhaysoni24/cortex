'use client';

import { useState } from 'react';
import {
  Database,
  Star,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

type DataSource = 'bigquery' | 'hubspot' | 'ga4';

const dataTabs: { key: DataSource; label: string }[] = [
  { key: 'bigquery', label: 'BigQuery' },
  { key: 'hubspot', label: 'HubSpot' },
  { key: 'ga4', label: 'GA4' },
];

const pinnedMetrics = [
  { name: 'MRR', value: '$142.8K', trend: 'up' as const, delta: '+4.2%' },
  { name: 'Active Users', value: '12,847', trend: 'up' as const, delta: '+8.1%' },
  { name: 'Churn Rate', value: '2.3%', trend: 'down' as const, delta: '-0.4%' },
  { name: 'NPS Score', value: '67', trend: 'flat' as const, delta: '0' },
];

const placeholderQuery = `SELECT
  DATE_TRUNC(created_at, MONTH) AS month,
  COUNT(DISTINCT user_id) AS active_users,
  SUM(revenue) AS total_revenue,
  AVG(session_duration_s) AS avg_session_sec
FROM \`analytics.events\`
WHERE created_at >= '2025-01-01'
GROUP BY month
ORDER BY month DESC
LIMIT 12;`;

const queryResults = [
  { month: '2026-03', active_users: '12,847', total_revenue: '$142,832', avg_session_sec: '284' },
  { month: '2026-02', active_users: '11,892', total_revenue: '$137,105', avg_session_sec: '271' },
  { month: '2026-01', active_users: '11,340', total_revenue: '$131,740', avg_session_sec: '263' },
  { month: '2025-12', active_users: '10,728', total_revenue: '$126,510', avg_session_sec: '258' },
  { month: '2025-11', active_users: '10,105', total_revenue: '$119,882', avg_session_sec: '245' },
];

const savedQueries = [
  { name: 'Monthly Revenue Breakdown', starred: true },
  { name: 'User Cohort Retention', starred: true },
  { name: 'Feature Adoption Rates', starred: false },
  { name: 'Funnel Drop-off Analysis', starred: true },
  { name: 'Lead Source Attribution', starred: false },
];

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendColors = {
  up: 'text-status-success',
  down: 'text-status-danger',
  flat: 'text-text-tertiary',
};

// Columns that contain numeric-like values (for right-alignment)
const numericColumns = new Set(['active_users', 'total_revenue', 'avg_session_sec']);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DataTerminalPage() {
  const [activeTab, setActiveTab] = useState<DataSource>('bigquery');

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border-default px-6 py-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-terminal-400" />
          <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-accent-500">
            Data Terminal
          </h1>
        </div>

        {/* Tab bar */}
        <div className="flex items-center border-2 border-border-default bg-bg-base">
          {dataTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 font-mono text-xs uppercase transition-colors',
                activeTab === tab.key
                  ? 'bg-accent-500 font-bold text-black'
                  : 'text-text-tertiary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Pinned Metrics strip */}
        <div className="grid grid-cols-4 gap-3">
          {pinnedMetrics.map((metric) => {
            const TrendIcon = trendIcons[metric.trend];
            return (
              <div
                key={metric.name}
                className="border-2 border-border-default rounded-none bg-bg-surface p-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent-500">
                  {metric.name}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-terminal-400">
                  {metric.value}
                </p>
                <div className={cn('mt-1 flex items-center gap-1 font-mono text-xs', trendColors[metric.trend])}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{metric.delta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Query editor + results */}
        <div className="grid grid-cols-3 gap-4">
          {/* Editor + results (2 cols) */}
          <div className="col-span-2 space-y-3">
            {/* Query editor */}
            <div className="border-2 border-border-default rounded-none bg-bg-surface">
              <div className="flex items-center justify-between border-b-2 border-border-default px-3 py-2">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-500">
                  Query Editor
                </h3>
                <button className="inline-flex items-center gap-2 rounded-none border-2 border-terminal-400 bg-transparent px-3 py-1.5 font-mono text-xs font-bold uppercase text-terminal-400 transition-colors hover:bg-terminal-400/10">
                  <Play className="h-3 w-3" />
                  Run
                </button>
              </div>
              <textarea
                defaultValue={placeholderQuery}
                placeholder="-- ENTER SQL QUERY..."
                className="h-44 w-full resize-none rounded-none border-0 bg-bg-base p-4 font-mono text-sm text-terminal-400 outline-none placeholder:text-terminal-400/40"
                spellCheck={false}
              />
            </div>

            {/* Results table */}
            <div className="border-2 border-border-default rounded-none">
              <div className="flex items-center justify-between border-b-2 border-border-default px-3 py-2">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-500">
                  Results
                </h3>
                <span className="rounded-none border-2 border-border-default bg-bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
                  {queryResults.length} rows
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-border-default bg-bg-elevated">
                      {Object.keys(queryResults[0]).map((col) => (
                        <th
                          key={col}
                          className={cn(
                            'px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-accent-500',
                            numericColumns.has(col) ? 'text-right' : 'text-left'
                          )}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border-subtle last:border-0 transition-colors hover:bg-bg-elevated"
                      >
                        {Object.entries(row).map(([key, val], j) => (
                          <td
                            key={j}
                            className={cn(
                              'px-3 py-2 font-mono text-sm text-text-primary',
                              numericColumns.has(key) ? 'text-right' : 'text-left'
                            )}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Saved queries sidebar */}
          <div className="border-2 border-border-default rounded-none bg-bg-surface">
            <div className="border-b-2 border-border-default px-3 py-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-accent-500">
                Saved Queries
              </h3>
            </div>
            <div className="space-y-0 p-2">
              {savedQueries.map((query) => (
                <div
                  key={query.name}
                  className="flex items-center gap-2 border-b border-border-subtle px-2 py-1.5 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer last:border-0"
                >
                  <Star
                    className={cn(
                      'h-3.5 w-3.5 shrink-0',
                      query.starred
                        ? 'fill-accent-500 text-accent-500'
                        : 'text-text-tertiary'
                    )}
                  />
                  <span className="flex-1 truncate">{query.name}</span>
                  <ChevronRight className="h-3 w-3 text-text-tertiary" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Terminal status bar */}
      <div className="border-t-2 border-border-default bg-bg-base px-4 py-1.5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-terminal-400">
          [SOURCE: BIGQUERY] | [STATUS: STUB] | [ROWS: 5] | [EXEC: 0.42s] | [LAST REFRESH: NEVER]
        </p>
      </div>
    </div>
  );
}
