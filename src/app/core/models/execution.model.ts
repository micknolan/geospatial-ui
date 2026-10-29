export type ExecutionKind = 'job' | 'query';
export type ExecutionChannel = 'REST' | 'JMS';
export type ExecutionStatus = 'succeeded' | 'failed' | 'timed_out';
export type HistoryRange = 7 | 30 | 90;

// ---------------------------------------------------------------------------------------------
// Execution History page (everything here can be derived from columns on the executions table:
// target id, status, start/end time, channel — none of it needs the result CLOB).
// ---------------------------------------------------------------------------------------------

/** One row of "Recent executions". `reference` is the client's referenceNumber (the result key). */
export interface ExecutionSummary {
  reference: string;
  kind: ExecutionKind;
  /** Job id or query id, used to link back to the definition. */
  targetId: string;
  name: string;
  channel: ExecutionChannel;
  startedLabel: string;
  durationMs: number;
  status: ExecutionStatus;
}

/** One day of workspace-wide figures; the charts and KPI tiles are derived from these. */
export interface DailyExecutionPoint {
  /** ISO date, yyyy-MM-dd */
  date: string;
  /** Short axis label, e.g. "29 Oct" */
  label: string;
  jobs: number;
  queries: number;
  failed: number;
  successRate: number;
  avgJobSec: number;
  p95JobSec: number;
  jms: number;
  rest: number;
}

export interface BusyJob {
  id: string;
  name: string;
  runs: number;
  successRate: number;
}

export interface StaleJob {
  id: string;
  name: string;
  detail: string;
}

export interface ExecutionHistoryData {
  range: HistoryRange;
  rangeLabel: string;
  series: DailyExecutionPoint[];
  previous: DailyExecutionPoint[];
  busiestJobs: BusyJob[];
  totalJobCount: number;
  staleJobs: StaleJob[];
  recent: ExecutionSummary[];
  recentTotal: number;
}

// ---------------------------------------------------------------------------------------------
// Stored result object (the JSON persisted against the referenceNumber).
// Field names mirror the service payload exactly.
// ---------------------------------------------------------------------------------------------

export type LayerAttributeValue = string | number | boolean | null;

export interface DatasetDetails {
  id: number;
  name: string;
  table: string;
  description: string;
  category: string;
  dateAdded: string;
  sensitiveData: boolean;
  geomIdentifier: string;
}

export interface SpatialQueryDefinition {
  id: number;
  name: string;
  description: string;
  sensitiveData: boolean;
  relationship: string;
  datasetDetails: DatasetDetails;
  operator: string;
  datasetColumns: string;
  intersectArea: boolean;
  distance: number | null;
  clause: string | null;
}

export interface Interaction {
  inputGeometryId: number;
  datasetGeometryId: number;
  intersectArea: number;
  relationship: string;
  layerAttributes: Record<string, LayerAttributeValue>;
}

export interface QueryResult {
  spatialQuery: SpatialQueryDefinition;
  runDate: string;
  executeTime: number;
  totalIntersectionArea: number;
  interactions: Interaction[];
  status: 'SUCCESS' | 'FAILED';
  /** Present when status is FAILED. */
  errorMessage?: string;
}

export interface ExecutionResult {
  clientReference: string;
  jobId: number | null;
  jobName: string | null;
  queryId: number | null;
  runDate: string;
  executeTime: number;
  inputSDOGeomIds: string;
  data: QueryResult[];
}
