import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-request-access',
  imports: [],
  templateUrl: './request-access.component.html',
  styleUrl: './request-access.component.scss',
})
export class RequestAccessComponent {
  readonly requested = signal(false);

  requestToJoin() {
    this.requested.set(true);
  }
}
