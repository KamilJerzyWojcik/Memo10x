import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-inline',
  standalone: true,
  template: `
    <div class="confirm">
      <span class="message">{{ message }}</span>
      <div class="actions">
        <button type="button" class="btn cancel" [disabled]="busy" (click)="cancel.emit()">Anuluj</button>
        <button type="button" class="btn danger" [disabled]="busy" (click)="confirm.emit()">Tak, usuń</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm { display: flex; align-items: center; gap: .75rem; margin-top: .5rem; }
    .message { color: #6b7280; font-size: .9rem; }
    .btn { padding: .375rem .625rem; border-radius: .5rem; border: 1px solid #d1d5db; background: #fff; }
    .danger { border-color: #ef4444; color: #ef4444; }
    .cancel { color: #374151; }
  `]
})
export class ConfirmInline {
  @Input() message = 'Tej operacji nie można cofnąć.';
  @Input() busy = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}


