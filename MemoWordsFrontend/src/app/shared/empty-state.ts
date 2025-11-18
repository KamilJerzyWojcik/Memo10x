import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <section class="empty">
      <h2 class="title">{{ title }}</h2>
      @if (description) {
        <p class="desc">{{ description }}</p>
      }
      @if (actionLabel) {
        <button type="button" class="btn" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </section>
  `,
  styles: [`
    .empty { padding: 2rem; text-align: center; color: #374151; }
    .title { font-size: 1.125rem; margin-bottom: .5rem; }
    .desc { color: #6b7280; margin-bottom: 1rem; }
    .btn { padding: .5rem .75rem; border-radius: .5rem; border: 1px solid #d1d5db; background: #fff; }
  `]
})
export class EmptyState {
  @Input() title = 'Brak danych';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}


