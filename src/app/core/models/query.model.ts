export type SpatialOperator = 'Intersects' | 'Within' | 'Contains' | 'Buffer' | 'Nearest';

export interface QuerySummary {
  id: string;
  name: string;
  category: string;
  operator: SpatialOperator;
  featureCount: number;
  usedInJobs: string[];
  compareDataset: string;
  createdBy: string;
  createdLabel: string;
}
