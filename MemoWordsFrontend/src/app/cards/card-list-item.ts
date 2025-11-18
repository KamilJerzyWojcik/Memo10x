import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardDto } from '../api/dtos';
import { DatePipe } from '@angular/common';
import { ConfirmInline } from '../shared/confirm-inline';

@Component({
  selector: 'app-card-list-item',
  standalone: true,
  imports: [DatePipe, ConfirmInline],
  template: `
    <article class="card-item">
      <div class="texts">
        <div class="source">{{ card?.sourceText }}</div>
        <div class="target">{{ card?.targetText }}</div>
      </div>
      <div class="meta">
        <span class="date">Dodano: {{ card?.createdAt | date:'short' }}</span>
        <span class="date">Aktualizacja: {{ card?.updatedAt | date:'short' }}</span>
      </div>
      <div class="actions">
        <button type="button" class="btn" (click)="edit.emit(card!.id)">Edytuj</button>
        <button type="button" class="btn danger" [disabled]="busy" (click)="requestDelete.emit(card!.id)">Usuń</button>
      </div>
      @if (confirming) {
        <app-confirm-inline
          [busy]="busy"
          (confirm)="confirmDelete.emit(card!.id)"
          (cancel)="cancelDelete.emit(card!.id)"
        />
      }
    </article>
  `,
  styles: [`
    .card-item {
      border: 1px solid #e5e7eb;
      border-radius: .75rem;
      padding: .75rem;
      display: flex;
      flex-direction: column;
      gap: .5rem;
      background: #fff;
    }
    .texts .source { font-weight: 600; color: #111827; }
    .texts .target { color: #374151; }
    .meta { color: #6b7280; font-size: .8rem; display: flex; gap: 1rem; }
    .actions { display: flex; gap: .5rem; }
    .btn { padding: .375rem .625rem; border-radius: .5rem; border: 1px solid #d1d5db; background: #fff; }
    .btn.danger { border-color: #ef4444; color: #ef4444; }
  `]
})
export class CardListItem {
  @Input() card?: CardDto;
  @Input() confirming = false;
  @Input() busy = false;
  @Output() edit = new EventEmitter<string>();
  @Output() requestDelete = new EventEmitter<string>();
  @Output() confirmDelete = new EventEmitter<string>();
  @Output() cancelDelete = new EventEmitter<string>();
}


