import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
}

/**
 * Mock LDAP/RHSSO sign-in. The service will front-end a Keycloak (RHSSO) realm
 * that federates identity from the DAFM LDAP directory — this UI never talks to
 * LDAP directly. Replace `login()` with a call to the RHSSO token endpoint (or a
 * BFF wrapper around it) once the backend is live; the resulting clientId is what
 * gets bound to a workspace server-side.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(credentials: LoginCredentials): Observable<AuthResult> {
    const success = credentials.username.trim().length > 0 && credentials.password.length > 0;

    return of(
      success
        ? { success: true }
        : { success: false, message: 'Invalid username or password. Please try again.' },
    ).pipe(delay(400));
  }
}
