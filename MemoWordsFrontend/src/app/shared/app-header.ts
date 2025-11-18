import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="app-header">
      <div class="brand">
        <a routerLink="/cards" aria-label="Przejdź do listy kart">Memo Words</a>
      </div>
      <nav class="nav">
        <a routerLink="/cards" class="nav-link">Karty</a>
      </nav>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      background: #fff;
    }
    .brand a {
      font-weight: 600;
      text-decoration: none;
      color: #111827;
      font-size: 1rem;
    }
    .nav .nav-link {
      text-decoration: none;
      color: #374151;
      font-size: 0.95rem;
    }
  `]
})
export class AppHeader {}


