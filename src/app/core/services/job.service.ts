import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Job, JobQueryRun } from '../models/job.model';

const JOBS: Job[] = [
  {
    id: 'q3-forestry-licence-compliance',
    name: 'Q3 Forestry Licence Compliance',
    description: 'Quarterly cross-check of felling licence areas against LPIS parcels and peatland extent.',
    referenceNumber: 'REF-0118',
    status: 'succeeded',
    queryCount: 22,
    datasetCount: 4,
    mode: 'JMS',
    lastRunLabel: '2h ago · 3m 12s',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '3 Jun 2026',
  },
  {
    id: 'anc-eligibility-review-2026',
    name: 'ANC Eligibility Review 2026',
    description: 'Annual review of Areas of Natural Constraint eligibility against current land parcels.',
    referenceNumber: 'REF-0122',
    status: 'succeeded',
    queryCount: 17,
    datasetCount: 3,
    mode: 'JMS',
    lastRunLabel: 'Yesterday · 2m 48s',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '10 Jun 2026',
  },
  {
    id: 'peatland-impact-assessment',
    name: 'Peatland Impact Assessment',
    description: 'Impact assessment of felling licence activity on national peatland extent.',
    referenceNumber: 'REF-0129',
    status: 'failed',
    queryCount: 14,
    datasetCount: 5,
    mode: 'JMS',
    lastRunLabel: '3d ago · 1m 05s',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '2 Jul 2026',
  },
  {
    id: 'watercourse-buffer-audit',
    name: 'Watercourse Buffer Audit',
    description: 'Buffer-zone compliance check for licensed activity near mapped watercourses.',
    referenceNumber: 'REF-0134',
    status: 'succeeded',
    queryCount: 11,
    datasetCount: 2,
    mode: 'REST',
    lastRunLabel: '5d ago · 4m 30s',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '14 Jul 2026',
  },
  {
    id: 'herd-holding-proximity-check',
    name: 'Herd Holding Proximity Check',
    description:
      'Nearest-neighbour and containment checks between herd holdings and ANC / Nitrates Action Programme boundaries, run county by county across the west region.',
    referenceNumber: 'REF-2026-08-0139',
    status: 'running',
    queryCount: 8,
    datasetCount: 3,
    mode: 'JMS',
    lastRunLabel: '4m 12s elapsed',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '18 Aug 2026',
    startedLabel: '4 minutes ago',
    avgQueryDuration: '1.5s',
    matchesSoFar: 415,
    progressComplete: 5,
    progressTotal: 8,
    datasetsUsed: ['Areas of Natural Constraint (ANC)', 'Nitrates Action Programme Zones', 'Herd Register Locations'],
  },
  {
    id: 'peatland-buffer-zone-check-offaly',
    name: 'Peatland Buffer Zone Check — Co. Offaly',
    description: 'Draft buffer-zone check around peatland extent in Co. Offaly, not yet submitted.',
    referenceNumber: 'REF-0140',
    status: 'draft',
    queryCount: 9,
    datasetCount: 2,
    mode: 'JMS',
    lastRunLabel: 'Not yet run',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '20 Aug 2026',
  },
  {
    id: 'gw-protection-overlap-audit',
    name: 'GW Protection Overlap Audit',
    description: 'Overlap audit between groundwater protection zones and LPIS parcels.',
    referenceNumber: 'REF-0141',
    status: 'succeeded',
    queryCount: 6,
    datasetCount: 2,
    mode: 'REST',
    lastRunLabel: '1w ago · 5m 51s',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '22 Aug 2026',
  },
  {
    id: 'cross-dataset-compliance-check',
    name: 'Cross-Dataset Compliance Check',
    description: 'Draft job combining the LPIS/felling-licence, watercourse buffer and nearest-ANC queries.',
    referenceNumber: 'REF-2026-08-0142',
    status: 'draft',
    queryCount: 3,
    datasetCount: 2,
    mode: 'JMS',
    lastRunLabel: 'Not yet run',
    workspace: 'Forestry',
    createdBy: 'M. Nolan',
    createdLabel: '28 Aug 2026',
  },
];

const HERD_HOLDING_RUNS: JobQueryRun[] = [
  { id: 'q1', name: 'Nearest ANC zone to herd holdings — Co. Galway', operator: 'Nearest', status: 'succeeded', matches: 142, durationLabel: '1.8s' },
  { id: 'q2', name: 'Herd holdings within Nitrates Action zones', operator: 'Within', status: 'succeeded', matches: 58, durationLabel: '1.2s' },
  { id: 'q3', name: 'Nearest ANC zone to herd holdings — Co. Mayo', operator: 'Nearest', status: 'succeeded', matches: 98, durationLabel: '1.6s' },
  { id: 'q4', name: 'Herd holdings within Nitrates Action zones — Co. Roscommon', operator: 'Within', status: 'succeeded', matches: 41, durationLabel: '1.0s' },
  { id: 'q5', name: 'Nearest water protection zone to herd holdings — Co. Galway', operator: 'Nearest', status: 'succeeded', matches: 76, durationLabel: '2.1s' },
  { id: 'q6', name: 'Herd register locations within ANC — Co. Leitrim', operator: 'Within', status: 'running', elapsedLabel: '12s elapsed' },
  { id: 'q7', name: 'Nearest ANC zone to herd holdings — Co. Sligo', operator: 'Nearest', status: 'queued' },
  { id: 'q8', name: 'Herd holdings within Nitrates Action zones — Co. Donegal', operator: 'Within', status: 'queued' },
];

const GENERIC_RUNS: JobQueryRun[] = [
  { id: 'g1', name: 'Query 1', operator: 'Intersects', status: 'succeeded', matches: 64, durationLabel: '1.1s' },
  { id: 'g2', name: 'Query 2', operator: 'Intersects', status: 'succeeded', matches: 22, durationLabel: '0.9s' },
];

@Injectable({ providedIn: 'root' })
export class JobService {
  getAll(): Observable<Job[]> {
    return of(JOBS);
  }

  getById(id: string): Observable<Job | undefined> {
    return of(JOBS.find((j) => j.id === id));
  }

  getQueryRuns(jobId: string): Observable<JobQueryRun[]> {
    return of(jobId === 'herd-holding-proximity-check' ? HERD_HOLDING_RUNS : GENERIC_RUNS);
  }

  get statusCounts() {
    return {
      running: JOBS.filter((j) => j.status === 'running').length,
      succeeded: JOBS.filter((j) => j.status === 'succeeded').length,
      failed: JOBS.filter((j) => j.status === 'failed').length,
      draft: JOBS.filter((j) => j.status === 'draft').length,
    };
  }
}
