import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="login">
      <h1>Logowanie</h1>
      <p>Widok logowania w przygotowaniu. Kliknij, aby przejść do listy kart.</p>
      <button type="button" (click)="goCards()">Przejdź do kart</button>
    </section>
  `
})
export class LoginPage {
  constructor(private readonly router: Router) {}
  goCards(): void {
    this.router.navigate(['/cards']);
  }
}


