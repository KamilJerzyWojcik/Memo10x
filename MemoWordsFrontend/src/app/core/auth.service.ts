import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  getAccessToken(): string | null {
    // Minimalna implementacja: odczyt tokena z localStorage
    // Klient Supabase (jeśli używany) może nadpisać tę logikę w przyszłości.
    const candidates = [
      'sb-access-token',
      'access_token',
      'supabase.access_token'
    ];
    for (const key of candidates) {
      const value = localStorage.getItem(key);
      if (value) {
        return value;
      }
    }
    return null;
  }

  ensureAuthenticated(returnUrl?: string): boolean {
    const token = this.getAccessToken();
    if (!token) {
      this.router.navigate(['/login'], { queryParams: returnUrl ? { returnUrl } : undefined });
      return false;
    }
    return true;
  }
}


