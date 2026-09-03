import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly showTerminology = signal(false);

  toggleTerminology() {
    this.showTerminology.update((v) => !v);
  }

  closeTerminology() {
    this.showTerminology.set(false);
  }
}
