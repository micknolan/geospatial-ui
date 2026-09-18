import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QuerySummary } from '../models/query.model';

const QUERIES: QuerySummary[] = [
  {
    id: 'peatland-fips',
    name: 'Peatland ∩ FIPS compartments',
    category: 'Forestry',
    operator: 'Intersects',
    featureCount: 98442,
    usedInJobs: ['Peatland Impact Assessment', 'Q3 Forestry Licence Compliance'],
    compareDataset: 'Forest Inventory Compartments (FIPS)',
    createdBy: 'M. Nolan',
    createdLabel: '3 Jun 2026',
  },
  {
    id: 'lpis-felling-licence',
    name: 'LPIS ∩ felling licence areas',
    category: 'Forestry',
    operator: 'Intersects',
    featureCount: 84213,
    usedInJobs: ['Q3 Forestry Licence Compliance', 'Cross-Dataset Compliance Check'],
    compareDataset: 'Forestry Felling Licence Areas',
    createdBy: 'M. Nolan',
    createdLabel: '3 Mar 2026',
  },
  {
    id: 'felling-licence-peatland',
    name: 'Felling licences ∩ peatland extent',
    category: 'Land',
    operator: 'Intersects',
    featureCount: 41900,
    usedInJobs: ['Peatland Impact Assessment'],
    compareDataset: 'Peatland Extent 2023',
    createdBy: 'M. Nolan',
    createdLabel: '2 Jul 2026',
  },
  {
    id: 'buffer-watercourses-wexford',
    name: '50m buffer — watercourses, Wexford',
    category: 'Water',
    operator: 'Buffer',
    featureCount: 12480,
    usedInJobs: ['Watercourse Buffer Audit', 'Cross-Dataset Compliance Check'],
    compareDataset: 'Licensed Activity Areas — Co. Wexford',
    createdBy: 'M. Nolan',
    createdLabel: '14 Jul 2026',
  },
  {
    id: 'anc-coastal-boundary',
    name: 'ANC zones ∩ coastal boundary',
    category: 'Boundaries',
    operator: 'Intersects',
    featureCount: 9760,
    usedInJobs: ['ANC Eligibility Review 2026'],
    compareDataset: 'National Coastal Boundary',
    createdBy: 'M. Nolan',
    createdLabel: '10 Jun 2026',
  },
  {
    id: 'gw-lpis-parcels',
    name: 'GW zones ∩ LPIS parcels',
    category: 'Water',
    operator: 'Intersects',
    featureCount: 6104,
    usedInJobs: ['GW Protection Overlap Audit'],
    compareDataset: 'Land Parcel Identification System (LPIS)',
    createdBy: 'M. Nolan',
    createdLabel: '22 Aug 2026',
  },
  {
    id: 'nearest-anc-herd-galway',
    name: 'Nearest ANC — herd holdings, Galway',
    category: 'Livestock',
    operator: 'Nearest',
    featureCount: 3150,
    usedInJobs: ['Herd Holding Proximity Check', 'Cross-Dataset Compliance Check'],
    compareDataset: 'Areas of Natural Constraint (ANC)',
    createdBy: 'M. Nolan',
    createdLabel: '18 Aug 2026',
  },
  {
    id: 'herd-nitrates-zones',
    name: 'Herd holdings ∩ nitrates zones',
    category: 'Water',
    operator: 'Intersects',
    featureCount: 2340,
    usedInJobs: ['Herd Holding Proximity Check'],
    compareDataset: 'Nitrates Action Programme Zones',
    createdBy: 'M. Nolan',
    createdLabel: '18 Aug 2026',
  },
];

@Injectable({ providedIn: 'root' })
export class QueryService {
  getAll(): Observable<QuerySummary[]> {
    return of(QUERIES);
  }

  getById(id: string): Observable<QuerySummary | undefined> {
    return of(QUERIES.find((q) => q.id === id));
  }
}
