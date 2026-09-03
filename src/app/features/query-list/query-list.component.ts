import { Component, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { QueryService } from '../../core/services/query.service';
import { QuerySummary } from '../../core/models/query.model';
import { CATEGORY_ORDER, categoryColor } from '../../core/models/category';
import { CategoryDotComponent } from '../../shared/components/category-dot/category-dot.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-query-list',
  imports: [CategoryDotComponent, StatusBadgeComponent, DecimalPipe],
  templateUrl: './query-list.component.html',
  styleUrl: './query-list.component.scss',
})
export class QueryListComponent {
  readonly categories = ['All', ...CATEGORY_ORDER];
  readonly categoryColor = categoryColor;

  private readonly queries = signal<QuerySummary[]>([]);
  readonly search = signal('');
  readonly categoryFilter = signal('All');
  readonly selectedId = signal<string | null>(null);

  readonly filteredQueries = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.categoryFilter();
    return this.queries().filter((q) => {
      const matchesTerm = !term || q.name.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || q.category === category;
      return matchesTerm && matchesCategory;
    });
  });

  readonly selectedQuery = computed(() => this.queries().find((q) => q.id === this.selectedId()));

  constructor(private readonly queryService: QueryService) {
    this.queryService.getAll().subscribe((queries) => {
      this.queries.set(queries);
      if (queries.length) {
        this.selectedId.set(queries[1]?.id ?? queries[0].id);
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
