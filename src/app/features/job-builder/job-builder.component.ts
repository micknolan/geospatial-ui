import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

export type BuilderOperator = 'Intersects' | 'Within' | 'Contains' | 'Buffer' | 'Nearest';

interface CompositionQuery {
  name: string;
  operator: BuilderOperator;
  meta: string;
  validity: 'valid' | 'validating';
}

const OPERATORS: BuilderOperator[] = ['Intersects', 'Within', 'Contains', 'Buffer', 'Nearest'];

@Component({
  selector: 'app-job-builder',
  imports: [FormsModule, RouterLink],
  templateUrl: './job-builder.component.html',
  styleUrl: './job-builder.component.scss',
})
export class JobBuilderComponent {
  readonly operators = OPERATORS;
  readonly isEditing = signal(false);

  readonly queryName = signal('LPIS parcels intersecting felling licence areas');
  readonly operator = signal<BuilderOperator>('Intersects');
  readonly wkt = signal('POLYGON((-6.941 53.349, -6.938 53.349, -6.938 53.352, -6.941 53.352, -6.941 53.349))');
  readonly compareDataset = signal('Forestry Felling Licence Areas');
  readonly compareDatasetMeta = signal('Polygon · 84,213 features · Forestry workspace');

  readonly referenceNumber = signal('REF-2026-08-0142');
  readonly executionMode = signal<'REST' | 'JMS'>('JMS');

  readonly composition = signal<CompositionQuery[]>([
    { name: 'LPIS ∩ felling licence areas', operator: 'Intersects', meta: 'Intersects · Forestry', validity: 'valid' },
    { name: '50m buffer around watercourses', operator: 'Buffer', meta: 'Buffer · Co. Wexford', validity: 'valid' },
    { name: 'Nearest ANC zone to herd holdings', operator: 'Nearest', meta: 'Nearest · Co. Galway', validity: 'validating' },
  ]);

  constructor(route: ActivatedRoute) {
    this.isEditing.set(!!route.snapshot.paramMap.get('id'));
  }

  setOperator(op: BuilderOperator) {
    this.operator.set(op);
  }

  setExecutionMode(mode: 'REST' | 'JMS') {
    this.executionMode.set(mode);
  }

  addQueryToJob() {
    this.composition.update((list) => [
      ...list,
      { name: this.queryName(), operator: this.operator(), meta: `${this.operator()} · new`, validity: 'validating' },
    ]);
  }
}
