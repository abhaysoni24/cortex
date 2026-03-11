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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DataTerminalPage() {
  const [activeTab, setActiveTab] = useState<DataSource>('bigquery');

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-accent-500" />
          <h1 className="text-lg font-semibold text-text-primary">Data Terminal</h1>
        </div>

        {/* Tab bar */}
        <div className="flex items-center rounded-md border border-border-subtle bg-bg-surface">
          {dataTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-bg-elevated text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
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
                className="rounded-md border border-border-subtle bg-bg-surface p-3"
              >
                <p className="text-xs text-text-tertiary">{metric.name}</p>
                <p className="mt-1 text-xl font-mono text-accent-500">{metric.value}</p>
                <div className={cn('mt-1 flex items-center gap-1 text-xs', trendColors[metric.trend])}>
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
            <div className="rounded-md border border-border-subtle bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Query Editor
                </h3>
                <Button size="sm">
                  <Play className="h-3 w-3" />
                  Run
                </Button>
              </div>
              <textarea
                defaultValue={placeholderQuery}
                className="h-44 w-full resize-none bg-bg-elevated p-4 font-mono text-sm text-text-primary outline-none"
                spellCheck={false}
              />
            </div>

            {/* Results table */}
            <div className="rounded-md border border-border-subtle bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Results
                </h3>
                <Badge>{queryResults.length} rows</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      {Object.keys(queryResults[0]).map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-tertiary"
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
                        className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated transition-colors"
                      >
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 font-mono text-xs text-text-primary"
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
          <div className="rounded-md border border-border-subtle bg-bg-surface">
            <div className="border-b border-border-subtle px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Saved Queries
              </h3>
            </div>
            <div className="space-y-0.5 p-2">
              {savedQueries.map((query) => (
                <div
                  key={query.name}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary cursor-pointer"
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
    </div>
  );
}
