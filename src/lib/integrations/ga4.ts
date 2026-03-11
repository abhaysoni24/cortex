/**
 * Google Analytics 4 (GA4) Integration
 *
 * Auth: Google Service Account or OAuth 2.0
 * Sync: On-demand report execution + scheduled snapshots
 * Entities: GA4 reports with dimensions and metrics
 *
 * Capabilities:
 * - Pull: Run custom reports, fetch key metrics (sessions, conversions, etc.)
 * - Action: Surface analytics data in briefings and dashboards
 * - Display: Metric trends within task context
 */

export interface GA4Config {
  propertyId: string;
  credentials: Record<string, unknown>;
}

export interface GA4Row {
  dimensionValues: string[];
  metricValues: number[];
}

export interface GA4Report {
  dimensions: string[];
  metrics: string[];
  rows: GA4Row[];
}

export interface GA4ReportConfig {
  dateRange: { startDate: string; endDate: string };
  dimensions: string[];
  metrics: string[];
  limit?: number;
}

/**
 * Run a custom GA4 report with specified dimensions and metrics.
 *
 * @param config - GA4 property ID and credentials
 * @param reportConfig - Report parameters (date range, dimensions, metrics)
 * @returns Formatted report with dimension and metric values per row
 */
export async function runReport(
  config: GA4Config,
  reportConfig: GA4ReportConfig
): Promise<GA4Report> {
  // TODO: Implement GA4 Data API call using @google-analytics/data
  // Uses analyticsdata.properties.runReport
  console.log(`GA4: runReport not yet implemented (property: ${config.propertyId})`);
  return {
    dimensions: reportConfig.dimensions,
    metrics: reportConfig.metrics,
    rows: [],
  };
}

/**
 * Fetch a snapshot of key metrics for today vs. the previous period.
 *
 * Includes: active users, sessions, conversions, bounce rate, revenue.
 * Useful for daily briefings and dashboard summaries.
 *
 * @param config - GA4 property ID and credentials
 * @returns A report comparing today's key metrics to the previous period
 */
export async function fetchKeyMetrics(config: GA4Config): Promise<GA4Report> {
  // TODO: Implement by calling runReport with predefined key metrics
  // Metrics: activeUsers, sessions, conversions, bounceRate, totalRevenue
  // Date range: today vs. yesterday (or today vs. same day last week)
  console.log(`GA4: fetchKeyMetrics not yet implemented (property: ${config.propertyId})`);
  return {
    dimensions: ['date'],
    metrics: ['activeUsers', 'sessions', 'conversions', 'bounceRate', 'totalRevenue'],
    rows: [],
  };
}
