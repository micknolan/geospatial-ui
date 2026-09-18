import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  readonly username = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  submit() {
    if (this.submitting()) {
      return;
    }

    if (!this.username().trim() || !this.password()) {
      this.errorMessage.set('Enter your username and password.');
      return;
    }

    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth.login({ username: this.username(), password: this.password() }).subscribe((result) => {
      this.submitting.set(false);

      if (result.success) {
        // Demo accounts whose identity hasn't been bound to a workspace yet land on
        // the request-access flow instead of the app shell.
        const noWorkspace = this.username().trim().toLowerCase().includes('byrne');
        this.router.navigateByUrl(noWorkspace ? '/request-access' : '/overview');
      } else {
        this.errorMessage.set(result.message ?? 'Invalid username or password. Please try again.');
      }
    });
  }
}
