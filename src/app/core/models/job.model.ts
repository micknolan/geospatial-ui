export type JobStatus = 'running' | 'succeeded' | 'failed' | 'draft';
export type ExecutionMode = 'REST' | 'JMS';

export interface Job {
  id: string;
  name: string;
  description: string;
  referenceNumber: string;
  status: JobStatus;
  queryCount: number;
  datasetCount: number;
  mode: ExecutionMode;
  lastRunLabel: string;
  workspace: string;
  createdBy: string;
  createdLabel: string;
  startedLabel?: string;
  avgQueryDuration?: string;
  matchesSoFar?: number;
  progressComplete?: number;
  progressTotal?: number;
  datasetsUsed?: string[];
}

export type JobQueryRunStatus = 'succeeded' | 'running' | 'queued' | 'failed';

export interface JobQueryRun {
  id: string;
  name: string;
  operator: string;
  status: JobQueryRunStatus;
  matches?: number;
  durationLabel?: string;
  elapsedLabel?: string;
}
