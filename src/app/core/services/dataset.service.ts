import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Dataset } from '../models/dataset.model';

const DATASETS: Dataset[] = [
  {
    id: 'lpis',
    name: 'Land Parcel Identification System (LPIS)',
    description:
      'Registered agricultural land parcels used for area-based payment schemes. Maintained annually and used across LPIS, ANC and cross-compliance spatial checks.',
    category: 'Land',
    geometryType: 'Polygon',
    featureCount: 1200000,
    updatedLabel: 'Updated Jun 2026',
    sourceTable: 'NPSS.LPIS_PARCELS_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '12 Jun 2026 · monthly',
    maintainedBy: 'Forest Service GIS Unit',
    schema: [
      { name: 'PARCEL_ID', type: 'VARCHAR2(20)' },
      { name: 'LAND_USE_CODE', type: 'VARCHAR2(6)' },
      { name: 'AREA_HA', type: 'NUMBER' },
      { name: 'SCHEME_YEAR', type: 'NUMBER(4)' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
  {
    id: 'felling-licence-areas',
    name: 'Forestry Felling Licence Areas',
    description: 'Approved felling licence boundaries issued under the Forestry Act.',
    category: 'Forestry',
    geometryType: 'Polygon',
    featureCount: 84213,
    updatedLabel: 'Updated Jul 2026',
    sourceTable: 'FORESTRY.FELLING_LICENCE_AREAS_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '4 Jul 2026 · weekly',
    maintainedBy: 'Forest Service GIS Unit',
    schema: [
      { name: 'LICENCE_ID', type: 'VARCHAR2(20)' },
      { name: 'LICENCE_TYPE', type: 'VARCHAR2(12)' },
      { name: 'ISSUE_DATE', type: 'DATE' },
      { name: 'AREA_HA', type: 'NUMBER' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
  {
    id: 'anc',
    name: 'Areas of Natural Constraint (ANC)',
    description: 'Designated areas eligible for constraint-based support payments.',
    category: 'Land',
    geometryType: 'Polygon',
    featureCount: 412880,
    updatedLabel: 'Updated Mar 2026',
    sourceTable: 'LAND.ANC_ZONES_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '3 Mar 2026 · annually',
    maintainedBy: 'Land Eligibility Unit',
    schema: [
      { name: 'ANC_ID', type: 'VARCHAR2(20)' },
      { name: 'CONSTRAINT_TYPE', type: 'VARCHAR2(24)' },
      { name: 'DESIGNATION_YEAR', type: 'NUMBER(4)' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
  {
    id: 'gw-protection-zones',
    name: 'Ground Water Protection Zones',
    description: 'Source protection zones for groundwater bodies of drinking water significance.',
    category: 'Water',
    geometryType: 'Polygon',
    featureCount: 6104,
    updatedLabel: 'Updated Feb 2026',
    sourceTable: 'WATER.GW_PROTECTION_ZONES_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '8 Feb 2026 · annually',
    maintainedBy: 'Water Quality Unit',
    schema: [
      { name: 'ZONE_ID', type: 'VARCHAR2(20)' },
      { name: 'PROTECTION_TIER', type: 'VARCHAR2(2)' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
  {
    id: 'peatland-extent-2023',
    name: 'Peatland Extent 2023',
    description: 'National peatland habitat extent derived from 2023 remote sensing survey.',
    category: 'Land',
    geometryType: 'Polygon',
    featureCount: 98442,
    updatedLabel: 'Updated Jan 2026',
    sourceTable: 'LAND.PEATLAND_EXTENT_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '15 Jan 2026 · annually',
    maintainedBy: 'National Parks & Wildlife Service',
    schema: [
      { name: 'PEAT_ID', type: 'VARCHAR2(20)' },
      { name: 'HABITAT_CODE', type: 'VARCHAR2(8)' },
      { name: 'SURVEY_YEAR', type: 'NUMBER(4)' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
  {
    id: 'fips-compartments',
    name: 'Forest Inventory Compartments (FIPS)',
    description: 'Sub-compartment boundaries from the national forest inventory planning system.',
    category: 'Forestry',
    geometryType: 'Polygon',
    featureCount: 221006,
    updatedLabel: 'Updated May 2026',
    sourceTable: 'FORESTRY.FIPS_COMPARTMENTS_V',
    spatialReference: 'ITM / EPSG:2157',
    coverage: 'National',
    lastRefreshedLabel: '2 May 2026 · quarterly',
    maintainedBy: 'Forest Service GIS Unit',
    schema: [
      { name: 'COMPARTMENT_ID', type: 'VARCHAR2(20)' },
      { name: 'SPECIES_CODE', type: 'VARCHAR2(6)' },
      { name: 'PLANT_YEAR', type: 'NUMBER(4)' },
      { name: 'GEOM', type: 'SDO_GEOMETRY' },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class DatasetService {
  getAll(): Observable<Dataset[]> {
    return of(DATASETS);
  }

  getById(id: string): Observable<Dataset | undefined> {
    return of(DATASETS.find((d) => d.id === id));
  }
}
