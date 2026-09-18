export type JobStatus = 'running' | 'succeeded' | 'failed' | 'draft';

export interface JobQueryItem {
  id: string;
  name: string;
  operator: string;
  fromDataset: string;
  toDataset: string;
}

export interface JobDatasetUsage {
  name: string;
  featureCount: number;
}

export interface Job {
  id: string;
  jobNumber: string;
  name: string;
  description: string;
  status: JobStatus;
  queryCount: number;
  datasetCount: number;
  workspace: string;
  createdBy: string;
  createdLabel: string;
  estimatedRuntimeLabel: string;
  totalFeatures: number;
  queries: JobQueryItem[];
  datasetsUsed: JobDatasetUsage[];
}
