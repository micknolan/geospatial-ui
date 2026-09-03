import { Component, Input } from '@angular/core';
import { categoryColor } from '../../../core/models/category';

@Component({
  selector: 'app-category-dot',
  template: `
    <div class="wrap">
      <span class="dot" [style.background]="categoryColor(category)"></span>
      <span class="label">{{ category }}</span>
    </div>
  `,
  styles: [`
    .wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      display: inline-block;
      flex-shrink: 0;
    }
    .label {
      font-size: 11.5px;
      color: var(--ink-muted);
    }
  `],
})
export class CategoryDotComponent {
  @Input({ required: true }) category!: string;
  categoryColor = categoryColor;
}
