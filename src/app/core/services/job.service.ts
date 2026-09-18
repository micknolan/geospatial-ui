import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Job } from '../models/job.model';

const JOBS: Job[] = [
  {
    id: 'q3-forestry-licence-compliance',
    jobNumber: '101021',
    name: 'Q3 Forestry Licence Compliance',
    description: 'Quarterly cross-check of felling licence areas against LPIS parcels and peatland extent.',
    status: 'succeeded',
    queryCount: 22,
    datasetCount: 4,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '3 Jun 2026',
    estimatedRuntimeLabel: '8–12 min',
    totalFeatures: 1_403_655,
    queries: [
      { id: 'q1', name: 'Felling licence areas within LPIS parcels', operator: 'Within', fromDataset: 'Felling Licence Areas', toDataset: 'LPIS' },
      { id: 'q2', name: 'Felling licence areas intersecting peatland extent', operator: 'Intersects', fromDataset: 'Felling Licence Areas', toDataset: 'Peatland Extent 2023' },
    ],
    datasetsUsed: [
      { name: 'LPIS', featureCount: 1_200_000 },
      { name: 'Felling Licence Areas', featureCount: 84_213 },
      { name: 'Peatland Extent 2023', featureCount: 98_442 },
      { name: 'Felling Compliance Register', featureCount: 21_000 },
    ],
  },
  {
    id: 'anc-eligibility-review-2026',
    jobNumber: '101034',
    name: 'ANC Eligibility Review 2026',
    description: 'Annual review of Areas of Natural Constraint eligibility against current land parcels.',
    status: 'succeeded',
    queryCount: 17,
    datasetCount: 3,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '10 Jun 2026',
    estimatedRuntimeLabel: '6–9 min',
    totalFeatures: 1_633_880,
    queries: [
      { id: 'q1', name: 'LPIS parcels within ANC boundaries', operator: 'Within', fromDataset: 'LPIS', toDataset: 'Areas of Natural Constraint (ANC)' },
      { id: 'q2', name: 'LPIS parcels intersecting ANC boundary changes', operator: 'Intersects', fromDataset: 'LPIS', toDataset: 'Areas of Natural Constraint (ANC)' },
    ],
    datasetsUsed: [
      { name: 'LPIS', featureCount: 1_200_000 },
      { name: 'Areas of Natural Constraint (ANC)', featureCount: 412_880 },
      { name: 'FIPS', featureCount: 21_000 },
    ],
  },
  {
    id: 'peatland-impact-assessment',
    jobNumber: '101052',
    name: 'Peatland Impact Assessment',
    description: 'Impact assessment of felling licence activity on national peatland extent.',
    status: 'failed',
    queryCount: 14,
    datasetCount: 5,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '2 Jul 2026',
    estimatedRuntimeLabel: '10–14 min',
    totalFeatures: 1_403_655,
    queries: [
      { id: 'q1', name: 'Felling licence areas buffered against peatland extent', operator: 'Buffer', fromDataset: 'Felling Licence Areas', toDataset: 'Peatland Extent 2023' },
      { id: 'q2', name: 'Peatland extent within LPIS parcels', operator: 'Within', fromDataset: 'Peatland Extent 2023', toDataset: 'LPIS' },
    ],
    datasetsUsed: [
      { name: 'LPIS', featureCount: 1_200_000 },
      { name: 'Peatland Extent 2023', featureCount: 98_442 },
      { name: 'Felling Licence Areas', featureCount: 84_213 },
      { name: 'FIPS', featureCount: 15_000 },
      { name: 'Areas of Natural Constraint (ANC)', featureCount: 6_000 },
    ],
  },
  {
    id: 'watercourse-buffer-audit',
    jobNumber: '101067',
    name: 'Watercourse Buffer Audit',
    description: 'Buffer-zone compliance check for licensed activity near mapped watercourses.',
    status: 'succeeded',
    queryCount: 11,
    datasetCount: 2,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '14 Jul 2026',
    estimatedRuntimeLabel: '5–7 min',
    totalFeatures: 106_213,
    queries: [
      { id: 'q1', name: 'Felling licence areas buffered against watercourse network', operator: 'Buffer', fromDataset: 'Felling Licence Areas', toDataset: 'Watercourse Network' },
    ],
    datasetsUsed: [
      { name: 'Felling Licence Areas', featureCount: 84_213 },
      { name: 'Watercourse Network', featureCount: 22_000 },
    ],
  },
  {
    id: 'herd-holding-proximity-check',
    jobNumber: '101094',
    name: 'Herd Holding Proximity Check',
    description:
      'Nearest-neighbour and containment checks between herd holdings and ANC / Nitrates Action Programme boundaries, run county by county across the west region.',
    status: 'running',
    queryCount: 8,
    datasetCount: 3,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '18 Aug 2026',
    estimatedRuntimeLabel: '5–8 min',
    totalFeatures: 456_280,
    queries: [
      {
        id: 'q1',
        name: 'Nearest ANC zone to herd holdings — Co. Galway',
        operator: 'Nearest',
        fromDataset: 'Herd Register Locations',
        toDataset: 'Areas of Natural Constraint (ANC)',
      },
      {
        id: 'q2',
        name: 'Herd holdings within Nitrates Action zones',
        operator: 'Within',
        fromDataset: 'Herd Register Locations',
        toDataset: 'Nitrates Action Programme Zones',
      },
      {
        id: 'q3',
        name: 'Nearest ANC zone to herd holdings — Co. Mayo',
        operator: 'Nearest',
        fromDataset: 'Herd Register Locations',
        toDataset: 'Areas of Natural Constraint (ANC)',
      },
    ],
    datasetsUsed: [
      { name: 'Herd Register Locations', featureCount: 38_540 },
      { name: 'Nitrates Action Programme Zones', featureCount: 4_860 },
      { name: 'Areas of Natural Constraint (ANC)', featureCount: 412_880 },
    ],
  },
  {
    id: 'peatland-buffer-zone-check-offaly',
    jobNumber: '101103',
    name: 'Peatland Buffer Zone Check — Co. Offaly',
    description: 'Draft buffer-zone check around peatland extent in Co. Offaly, not yet submitted.',
    status: 'draft',
    queryCount: 9,
    datasetCount: 2,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '20 Aug 2026',
    estimatedRuntimeLabel: '4–6 min',
    totalFeatures: 98_442,
    queries: [
      { id: 'q1', name: 'Peatland extent buffered — Co. Offaly', operator: 'Buffer', fromDataset: 'Peatland Extent 2023', toDataset: 'LPIS' },
    ],
    datasetsUsed: [
      { name: 'Peatland Extent 2023', featureCount: 98_442 },
      { name: 'LPIS', featureCount: 0 },
    ],
  },
  {
    id: 'gw-protection-overlap-audit',
    jobNumber: '101115',
    name: 'GW Protection Overlap Audit',
    description: 'Overlap audit between groundwater protection zones and LPIS parcels.',
    status: 'succeeded',
    queryCount: 6,
    datasetCount: 2,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '22 Aug 2026',
    estimatedRuntimeLabel: '3–5 min',
    totalFeatures: 1_206_104,
    queries: [
      { id: 'q1', name: 'Groundwater protection zones intersecting LPIS parcels', operator: 'Intersects', fromDataset: 'GW Protection Zones', toDataset: 'LPIS' },
    ],
    datasetsUsed: [
      { name: 'GW Protection Zones', featureCount: 6_104 },
      { name: 'LPIS', featureCount: 1_200_000 },
    ],
  },
  {
    id: 'cross-dataset-compliance-check',
    jobNumber: '101128',
    name: 'Cross-Dataset Compliance Check',
    description: 'Draft job combining the LPIS/felling-licence, watercourse buffer and nearest-ANC queries.',
    status: 'draft',
    queryCount: 3,
    datasetCount: 2,
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '28 Aug 2026',
    estimatedRuntimeLabel: '6–9 min',
    totalFeatures: 1_284_213,
    queries: [
      { id: 'q1', name: 'Felling licence areas within LPIS parcels', operator: 'Within', fromDataset: 'Felling Licence Areas', toDataset: 'LPIS' },
    ],
    datasetsUsed: [
      { name: 'LPIS', featureCount: 1_200_000 },
      { name: 'Felling Licence Areas', featureCount: 84_213 },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class JobService {
  getAll(): Observable<Job[]> {
    return of(JOBS);
  }

  getById(id: string): Observable<Job | undefined> {
    return of(JOBS.find((j) => j.id === id));
  }
}
