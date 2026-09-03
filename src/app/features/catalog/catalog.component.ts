import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DatasetService } from '../../core/services/dataset.service';
import { Dataset } from '../../core/models/dataset.model';
import { CATEGORY_ORDER, categoryColor } from '../../core/models/category';

@Component({
  selector: 'app-catalog',
  imports: [DecimalPipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  readonly categories = ['All', ...CATEGORY_ORDER];
  readonly categoryColor = categoryColor;

  private readonly datasets = signal<Dataset[]>([]);
  readonly search = signal('');
  readonly categoryFilter = signal('All');
  readonly selectedId = signal<string | null>(null);

  readonly filteredDatasets = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.categoryFilter();
    return this.datasets().filter((d) => {
      const matchesTerm = !term || d.name.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || d.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  readonly selectedDataset = computed(() => this.datasets().find((d) => d.id === this.selectedId()));

  constructor(private readonly datasetService: DatasetService) {
    this.datasetService.getAll().subscribe((datasets) => {
      this.datasets.set(datasets);
      if (datasets.length) {
        this.selectedId.set(datasets[0].id);
      }
    });
  }

  select(id: string) {
    this.selectedId.set(id);
  }

  onSearch(value: string) {
    this.search.set(value);
  }

  setCategory(category: string) {
    this.categoryFilter.set(category);
  }
}
