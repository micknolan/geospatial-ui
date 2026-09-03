export type SpatialOperator = 'Intersects' | 'Within' | 'Contains' | 'Buffer' | 'Nearest';

export interface JobUsage {
  jobName: string;
  status: JobStatus;
}

export type JobStatus = 'succeeded' | 'running' | 'failed' | 'draft';

export interface QuerySummary {
  id: string;
  name: string;
  category: string;
  operator: SpatialOperator;
  scanned: number;
  found: number;
  usedInJobs: JobUsage[];
  primaryDataset: string;
  compareDataset: string;
  sql: string;
  avgRuntimeLabel: string;
  runCount: number;
  failureCount: number;
  createdBy: string;
  createdLabel: string;
}
