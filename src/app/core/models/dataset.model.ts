export interface DatasetSchemaField {
  name: string;
  type: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: string;
  geometryType: string;
  featureCount: number;
  updatedLabel: string;
  sourceTable: string;
  spatialReference: string;
  coverage: string;
  lastRefreshedLabel: string;
  maintainedBy: string;
  schema: DatasetSchemaField[];
}
