import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { categoryColor } from '../../core/models/category';
import { QueryService } from '../../core/services/query.service';

export type BuilderOperator =
  | 'Intersects'
  | 'Within'
  | 'Contains'
  | 'Covers'
  | 'CoveredBy'
  | 'Touch'
  | 'Overlap'
  | 'Equal'
  | 'Disjoint'
  | 'On'
  | 'WithinDistance'
  | 'Nearest'
  | 'Buffer';

interface OperatorDef {
  id: BuilderOperator;
  label: string;
}

const OPERATORS: OperatorDef[] = [
  { id: 'Intersects', label: 'Intersects' },
  { id: 'Within', label: 'Within' },
  { id: 'Contains', label: 'Contains' },
  { id: 'Covers', label: 'Covers' },
  { id: 'CoveredBy', label: 'CoveredBy' },
  { id: 'Touch', label: 'Touch' },
  { id: 'Overlap', label: 'Overlap' },
  { id: 'Equal', label: 'Equal' },
  { id: 'Disjoint', label: 'Disjoint' },
  { id: 'On', label: 'On' },
  { id: 'WithinDistance', label: 'Within Distance' },
  { id: 'Nearest', label: 'Nearest' },
  { id: 'Buffer', label: 'Buffer' },
];

interface BuilderDataset {
  id: string;
  name: string;
  category: string;
  geometryType: string;
  featureCount: number;
  sensitive: boolean;
  schema: string[];
}

const DATASETS: BuilderDataset[] = [
  {
    id: 'herd-register-locations',
    name: 'Herd Register Locations',
    category: 'Livestock',
    geometryType: 'Point',
    featureCount: 142_900,
    sensitive: true,
    schema: ['HOLDING_ID', 'HERD_NO', 'GEOM', 'TOWNLAND', 'LAST_UPDATED'],
  },
  {
    id: 'lpis',
    name: 'Land Parcel Identification System (LPIS)',
    category: 'Land',
    geometryType: 'Polygon',
    featureCount: 918_204,
    sensitive: true,
    schema: ['PARCEL_ID', 'PARCEL_REF', 'GEOM', 'CROP_CODE', 'LAST_UPDATED'],
  },
  {
    id: 'nitrates-action-zones',
    name: 'Nitrates Action Zones',
    category: 'Water',
    geometryType: 'Polygon',
    featureCount: 5_220,
    sensitive: false,
    schema: ['ZONE_ID', 'ZONE_NAME', 'GEOM', 'DESIGNATED', 'LAST_UPDATED'],
  },
  {
    id: 'felling-licence-areas',
    name: 'Forestry Felling Licence Areas',
    category: 'Forestry',
    geometryType: 'Polygon',
    featureCount: 84_213,
    sensitive: false,
    schema: ['LICENCE_ID', 'LICENCE_REF', 'GEOM', 'SPECIES', 'LAST_UPDATED'],
  },
];

const CATEGORY_FILTERS = ['All', 'Livestock', 'Water'];

const JOB_OPTIONS = ['Herd Holding Proximity Check', 'Q3 Forestry Licence Compliance', 'Cross-Dataset Compliance Check'];

const OPERATOR_TABLES: Record<string, string> = {
  'herd-register-locations': 'LIVESTOCK.HERD_REGISTER_LOCATIONS_V',
  lpis: 'LAND.LPIS_V',
  'nitrates-action-zones': 'WATER.NITRATES_ACTION_ZONES_V',
  'felling-licence-areas': 'FORESTRY.FELLING_LICENCE_AREAS_V',
};

@Component({
  selector: 'app-query-builder',
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './query-builder.component.html',
  styleUrl: './query-builder.component.scss',
})
export class QueryBuilderComponent {
  readonly operators = OPERATORS;
  readonly categoryFilters = CATEGORY_FILTERS;
  readonly jobOptions = JOB_OPTIONS;
  readonly categoryColor = categoryColor;

  readonly isEditing = signal(false);

  readonly queryName = signal('Herd holdings within 250m of nitrates zones');
  readonly description = signal('Flags herd holdings close to designated nitrates action zones');
  readonly operator = signal<BuilderOperator>('WithinDistance');
  readonly distanceMeters = signal(250);

  readonly datasetSearch = signal('');
  readonly categoryFilter = signal('All');
  readonly selectedDatasetId = signal('herd-register-locations');

  readonly selectedColumns = signal<Set<string>>(new Set(['HOLDING_ID', 'HERD_NO', 'GEOM']));
  readonly calculateIntersectArea = signal(true);
  readonly roundIntersectArea = signal(true);

  readonly sandboxValidated = signal(false);
  readonly sandboxResult = signal('');

  readonly saved = signal(false);
  readonly savedQueryId = signal('');

  readonly addToJobTarget = signal(JOB_OPTIONS[0]);
  readonly addedToJob = signal('');

  readonly filteredDatasets = computed(() => {
    const term = this.datasetSearch().trim().toLowerCase();
    const category = this.categoryFilter();
    return DATASETS.filter((d) => {
      const matchesTerm = !term || d.name.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || d.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  readonly selectedDataset = computed(() => DATASETS.find((d) => d.id === this.selectedDatasetId()));

  readonly isWithinDistance = computed(() => this.operator() === 'WithinDistance');

  readonly operatorLabel = computed(() => this.operators.find((o) => o.id === this.operator())?.label ?? '');

  readonly generatedSql = computed(() => {
    const ds = this.selectedDataset();
    if (!ds) return '';
    const table = OPERATOR_TABLES[ds.id] ?? ds.name;
    const cols = [...this.selectedColumns()];
    const selectCols = cols.length ? cols.map((c) => `h.${c}`).join(', ') : '*';
    const areaClause = this.calculateIntersectArea()
      ? `,\n       ${this.roundIntersectArea() ? 'ROUND(' : ''}SDO_GEOM.SDO_AREA(\n         SDO_GEOM.SDO_INTERSECTION(:submitted_geom, h.GEOM, 0.005), 0.005\n       )${this.roundIntersectArea() ? ')' : ''} AS INTERSECT_AREA_SQM`
      : '';
    const whereClause = this.isWithinDistance()
      ? `SDO_WITHIN_DISTANCE(:submitted_geom, h.GEOM,\n      'distance=${this.distanceMeters()} unit=meter') = 'TRUE'`
      : `SDO_${this.operator().toUpperCase()}(:submitted_geom, h.GEOM) = 'TRUE'`;
    return `SELECT ${selectCols}${areaClause}\nFROM ${table} h\nWHERE ${whereClause}`;
  });

  constructor(route: ActivatedRoute, private readonly queryService: QueryService) {
    const id = route.snapshot.paramMap.get('id');
    this.isEditing.set(!!id);
    if (id) {
      this.queryService.getById(id).subscribe((q) => {
        if (!q) return;
        this.queryName.set(q.name);
        this.description.set(`Compares a submitted geometry against ${q.compareDataset}.`);
        this.operator.set(q.operator);
        const match = DATASETS.find((d) => d.name === q.compareDataset);
        if (match) {
          this.selectedDatasetId.set(match.id);
          this.selectedColumns.set(new Set(match.schema.slice(0, 3)));
        }
      });
    }
  }

  setOperator(op: BuilderOperator) {
    this.operator.set(op);
  }

  onDatasetSearch(value: string) {
    this.datasetSearch.set(value);
  }

  setCategoryFilter(category: string) {
    this.categoryFilter.set(category);
  }

  selectDataset(id: string) {
    this.selectedDatasetId.set(id);
  }

  toggleColumn(column: string) {
    this.selectedColumns.update((cols) => {
      const next = new Set(cols);
      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }
      return next;
    });
  }

  selectAllColumns() {
    const ds = this.selectedDataset();
    if (ds) this.selectedColumns.set(new Set(ds.schema));
  }

  clearColumns() {
    this.selectedColumns.set(new Set());
  }

  toggleCalculateIntersectArea() {
    this.calculateIntersectArea.update((v) => !v);
  }

  toggleRoundIntersectArea() {
    this.roundIntersectArea.update((v) => !v);
  }

  validateInSandbox() {
    this.sandboxValidated.set(true);
    this.sandboxResult.set('Valid · matched 3 of 5 sandbox geometries · ~0.6s');
  }

  saveQuery() {
    this.saved.set(true);
    this.savedQueryId.set(`QRY-${Math.floor(500000 + Math.random() * 9999)}`);
  }

  setAddToJobTarget(value: string) {
    this.addToJobTarget.set(value);
  }

  addToJob() {
    this.addedToJob.set(this.addToJobTarget());
  }
}
