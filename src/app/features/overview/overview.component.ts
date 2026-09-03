import { Component } from '@angular/core';
import { StatTileComponent } from '../../shared/components/stat-tile/stat-tile.component';
import { DonutChartComponent, DonutSegment } from '../../shared/components/donut-chart/donut-chart.component';
import { BarChartComponent, AxisTick } from '../../shared/components/bar-chart/bar-chart.component';
import { CATEGORY_COLORS, CATEGORY_OTHER_COLOR } from '../../core/models/category';

// Fixed slice order for named (non-category) pies: distinct hues in a fixed
// sequence, never reassigned by rank/filter — the categorical palette rule.
const SLICE_PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];

function buildNamedPie(items: { name: string; value: number }[], otherLabel: string, otherValue: number): DonutSegment[] {
  return [
    ...items.map((it, idx) => ({ name: it.name, value: it.value, color: SLICE_PALETTE[idx] })),
    { name: otherLabel, value: otherValue, color: CATEGORY_OTHER_COLOR },
  ];
}

function buildCategoryPie(items: { name: string; value: number }[]): DonutSegment[] {
  return items.map((it) => ({ name: it.name, value: it.value, color: CATEGORY_COLORS[it.name] ?? CATEGORY_OTHER_COLOR }));
}

@Component({
  selector: 'app-overview',
  imports: [StatTileComponent, DonutChartComponent, BarChartComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  // stat tiles
  readonly totalJobs = 8;
  readonly totalQueries = 90;
  readonly datasetsInUse = 70;
  readonly avgQueriesPerJob = '11.3';
  readonly totalMatchesFound = '1,842';

  // Jobs by Query Volume
  readonly pieQueryVolume: DonutSegment[] = buildNamedPie(
    [
      { name: 'Q3 Forestry Licence Compliance', value: 22 },
      { name: 'ANC Eligibility Review 2026', value: 17 },
      { name: 'Peatland Impact Assessment', value: 14 },
      { name: 'Watercourse Buffer Audit', value: 11 },
      { name: 'Herd Holding Proximity Check', value: 8 },
    ],
    'Other (3 jobs)',
    18,
  );
  readonly pieQueryVolumeTotal = 90;

  // Jobs by Dataset Footprint
  readonly pieDatasetFootprint: DonutSegment[] = buildNamedPie(
    [
      { name: 'Q3 Forestry Licence Compliance', value: 4 },
      { name: 'ANC Eligibility Review 2026', value: 3 },
      { name: 'Peatland Impact Assessment', value: 5 },
      { name: 'Watercourse Buffer Audit', value: 2 },
      { name: 'Herd Holding Proximity Check', value: 3 },
    ],
    'Other (3 jobs)',
    6,
  );
  readonly pieDatasetFootprintTotal = 23;

  // Queries by Category
  readonly queryCategory: DonutSegment[] = buildCategoryPie([
    { name: 'Land', value: 34 },
    { name: 'Forestry', value: 24 },
    { name: 'Water', value: 16 },
    { name: 'Boundaries', value: 10 },
    { name: 'Livestock', value: 6 },
  ]);
  readonly queryCategoryTotal = 90;

  // Datasets by Category
  readonly datasetCategory: DonutSegment[] = buildCategoryPie([
    { name: 'Land', value: 27 },
    { name: 'Forestry', value: 19 },
    { name: 'Water', value: 12 },
    { name: 'Boundaries', value: 8 },
    { name: 'Livestock', value: 4 },
  ]);
  readonly datasetCategoryTotal = 70;

  // Query Coverage bar chart
  readonly queryBars = [
    { name: 'Peatland ∩ FIPS compartments', value: 98442 },
    { name: 'LPIS ∩ felling licence areas', value: 84213 },
    { name: 'Felling licences ∩ peatland extent', value: 41900 },
    { name: '50m buffer — watercourses, Wexford', value: 12480 },
    { name: 'ANC zones ∩ coastal boundary', value: 9760 },
    { name: 'GW zones ∩ LPIS parcels', value: 6104 },
    { name: 'Nearest ANC — herd holdings, Galway', value: 3150 },
    { name: 'Herd holdings ∩ nitrates zones', value: 2340 },
  ];
  readonly queryAxisMax = 100000;
  readonly queryTicks: AxisTick[] = [
    { label: '0', bottom: 0 },
    { label: '25K', bottom: 42 },
    { label: '50K', bottom: 85 },
    { label: '75K', bottom: 127 },
    { label: '100K', bottom: 170 },
  ];

  // Dataset Size bar chart
  readonly datasetBars = [
    { name: 'LPIS', value: 1_200_000 },
    { name: 'ANC', value: 412_880 },
    { name: 'FIPS compartments', value: 221_006 },
    { name: 'Peatland Extent 2023', value: 98_442 },
    { name: 'Felling Licence Areas', value: 84_213 },
    { name: 'GW Protection Zones', value: 6_104 },
  ];
  readonly datasetAxisMax = 450_000;
  readonly datasetTicks: AxisTick[] = [
    { label: '0', bottom: 0 },
    { label: '150K', bottom: 57 },
    { label: '300K', bottom: 113 },
    { label: '450K', bottom: 170 },
  ];
}
