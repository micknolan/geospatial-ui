import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { QuerySummary } from '../models/query.model';

const QUERIES: QuerySummary[] = [
  {
    id: 'peatland-fips',
    name: 'Peatland ∩ FIPS compartments',
    category: 'Forestry',
    operator: 'Intersects',
    scanned: 98442,
    found: 187,
    usedInJobs: [
      { jobName: 'Peatland Impact Assessment', status: 'failed' },
      { jobName: 'Q3 Forestry Licence Compliance', status: 'succeeded' },
    ],
    primaryDataset: 'Peatland Extent 2023',
    compareDataset: 'Forest Inventory Compartments (FIPS)',
    sql: `SELECT p.PEAT_ID, p.GEOM
FROM FORESTRY.PEATLAND_EXTENT_V p,
     FORESTRY.FIPS_COMPARTMENTS_V f
WHERE SDO_RELATE(p.GEOM, f.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '1.9s',
    runCount: 24,
    failureCount: 2,
    createdBy: 'M. Nolan',
    createdLabel: '3 Jun 2026',
  },
  {
    id: 'lpis-felling-licence',
    name: 'LPIS ∩ felling licence areas',
    category: 'Forestry',
    operator: 'Intersects',
    scanned: 84213,
    found: 34,
    usedInJobs: [
      { jobName: 'Q3 Forestry Licence Compliance', status: 'succeeded' },
      { jobName: 'Cross-Dataset Compliance Check', status: 'draft' },
    ],
    primaryDataset: 'Land Parcel Identification System (LPIS)',
    compareDataset: 'Forestry Felling Licence Areas',
    sql: `SELECT p.PARCEL_ID, p.GEOM
FROM FORESTRY.LPIS_PARCELS_V p,
     FORESTRY.FELLING_LICENCE_AREAS_V f
WHERE SDO_RELATE(p.GEOM, f.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '1.4s',
    runCount: 16,
    failureCount: 1,
    createdBy: 'M. Nolan',
    createdLabel: '3 Mar 2026',
  },
  {
    id: 'felling-licence-peatland',
    name: 'Felling licences ∩ peatland extent',
    category: 'Land',
    operator: 'Intersects',
    scanned: 41900,
    found: 22,
    usedInJobs: [{ jobName: 'Peatland Impact Assessment', status: 'failed' }],
    primaryDataset: 'Forestry Felling Licence Areas',
    compareDataset: 'Peatland Extent 2023',
    sql: `SELECT f.LICENCE_ID, f.GEOM
FROM FORESTRY.FELLING_LICENCE_AREAS_V f,
     FORESTRY.PEATLAND_EXTENT_V p
WHERE SDO_RELATE(f.GEOM, p.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '1.1s',
    runCount: 9,
    failureCount: 3,
    createdBy: 'M. Nolan',
    createdLabel: '2 Jul 2026',
  },
  {
    id: 'buffer-watercourses-wexford',
    name: '50m buffer — watercourses, Wexford',
    category: 'Water',
    operator: 'Buffer',
    scanned: 12480,
    found: 96,
    usedInJobs: [
      { jobName: 'Watercourse Buffer Audit', status: 'succeeded' },
      { jobName: 'Cross-Dataset Compliance Check', status: 'draft' },
    ],
    primaryDataset: 'National Watercourses Network',
    compareDataset: 'Licensed Activity Areas — Co. Wexford',
    sql: `SELECT w.WATERCOURSE_ID, w.GEOM
FROM WATER.WATERCOURSES_V w,
     FORESTRY.LICENSED_ACTIVITY_WEXFORD_V a
WHERE SDO_RELATE(SDO_GEOM.SDO_BUFFER(w.GEOM, 50, 0.005), a.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '4.3s',
    runCount: 11,
    failureCount: 0,
    createdBy: 'M. Nolan',
    createdLabel: '14 Jul 2026',
  },
  {
    id: 'anc-coastal-boundary',
    name: 'ANC zones ∩ coastal boundary',
    category: 'Boundaries',
    operator: 'Intersects',
    scanned: 9760,
    found: 41,
    usedInJobs: [{ jobName: 'ANC Eligibility Review 2026', status: 'succeeded' }],
    primaryDataset: 'Areas of Natural Constraint (ANC)',
    compareDataset: 'National Coastal Boundary',
    sql: `SELECT a.ANC_ID, a.GEOM
FROM LAND.ANC_ZONES_V a,
     BOUNDARIES.COASTAL_BOUNDARY_V c
WHERE SDO_RELATE(a.GEOM, c.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '0.8s',
    runCount: 6,
    failureCount: 0,
    createdBy: 'M. Nolan',
    createdLabel: '10 Jun 2026',
  },
  {
    id: 'gw-lpis-parcels',
    name: 'GW zones ∩ LPIS parcels',
    category: 'Water',
    operator: 'Intersects',
    scanned: 6104,
    found: 15,
    usedInJobs: [{ jobName: 'GW Protection Overlap Audit', status: 'succeeded' }],
    primaryDataset: 'Ground Water Protection Zones',
    compareDataset: 'Land Parcel Identification System (LPIS)',
    sql: `SELECT g.ZONE_ID, g.GEOM
FROM WATER.GW_PROTECTION_ZONES_V g,
     FORESTRY.LPIS_PARCELS_V p
WHERE SDO_RELATE(g.GEOM, p.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '0.6s',
    runCount: 5,
    failureCount: 0,
    createdBy: 'M. Nolan',
    createdLabel: '22 Aug 2026',
  },
  {
    id: 'nearest-anc-herd-galway',
    name: 'Nearest ANC — herd holdings, Galway',
    category: 'Livestock',
    operator: 'Nearest',
    scanned: 3150,
    found: 142,
    usedInJobs: [
      { jobName: 'Herd Holding Proximity Check', status: 'running' },
      { jobName: 'Cross-Dataset Compliance Check', status: 'draft' },
    ],
    primaryDataset: 'Herd Register Locations',
    compareDataset: 'Areas of Natural Constraint (ANC)',
    sql: `SELECT h.HOLDING_ID, a.ANC_ID, SDO_NN_DISTANCE(1) DIST
FROM LIVESTOCK.HERD_REGISTER_V h,
     LAND.ANC_ZONES_V a
WHERE SDO_NN(h.GEOM, a.GEOM,
      'sdo_num_res=1', 1) = 'TRUE'`,
    avgRuntimeLabel: '1.8s',
    runCount: 20,
    failureCount: 0,
    createdBy: 'M. Nolan',
    createdLabel: '18 Aug 2026',
  },
  {
    id: 'herd-nitrates-zones',
    name: 'Herd holdings ∩ nitrates zones',
    category: 'Water',
    operator: 'Intersects',
    scanned: 2340,
    found: 58,
    usedInJobs: [{ jobName: 'Herd Holding Proximity Check', status: 'running' }],
    primaryDataset: 'Herd Register Locations',
    compareDataset: 'Nitrates Action Programme Zones',
    sql: `SELECT h.HOLDING_ID, h.GEOM
FROM LIVESTOCK.HERD_REGISTER_V h,
     WATER.NITRATES_ACTION_ZONES_V n
WHERE SDO_RELATE(h.GEOM, n.GEOM,
      'mask=ANYINTERACT') = 'TRUE'`,
    avgRuntimeLabel: '1.2s',
    runCount: 20,
    failureCount: 0,
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
