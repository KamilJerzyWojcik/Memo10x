import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    @if (show) {
      <div class="overlay" role="status" aria-live="polite" aria-label="Ładowanie">
        <div class="spinner"></div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display: grid;
      place-items: center;
      z-index: 1000;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #ddd;
      border-top-color: #111827;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinner {
  @Input() show = false;
}


