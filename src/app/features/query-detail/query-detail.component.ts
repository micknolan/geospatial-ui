import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { QueryService } from '../../core/services/query.service';
import { QuerySummary } from '../../core/models/query.model';
import { categoryColor } from '../../core/models/category';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-query-detail',
  imports: [RouterLink, StatusBadgeComponent, DecimalPipe],
  templateUrl: './query-detail.component.html',
  styleUrl: './query-detail.component.scss',
})
export class QueryDetailComponent {
  readonly query = signal<QuerySummary | undefined>(undefined);
  readonly categoryColor = categoryColor;

  constructor(route: ActivatedRoute, private readonly queryService: QueryService) {
    route.paramMap.subscribe((params) => {
      const id = params.get('id')!;
      this.queryService.getById(id).subscribe((query) => this.query.set(query));
    });
  }
}
