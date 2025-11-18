import { Component, EventEmitter, Input, Output, computed, input } from '@angular/core';

@Component({
  selector: 'app-paginator',
  standalone: true,
  template: `
    <nav class="paginator" aria-label="Paginacja">
      <button type="button" class="btn" [disabled]="page() <= 1 || disabled" (click)="go(page() - 1)">&lt;</button>
      @for (p of pages(); track p) {
        <button type="button" class="btn" [class.active]="p === page()" [disabled]="disabled" (click)="go(p)">{{ p }}</button>
      }
      <button type="button" class="btn" [disabled]="page() >= lastPage() || disabled" (click)="go(page() + 1)">&gt;</button>
    </nav>
  `,
  styles: [`
    .paginator { display: flex; gap: .25rem; align-items: center; }
    .btn { min-width: 2rem; height: 2rem; border: 1px solid #d1d5db; background: #fff; border-radius: .375rem; }
    .btn.active { background: #111827; color: #fff; border-color: #111827; }
  `]
})
export class Paginator {
  page = input.required<number>();
  pageSize = input.required<number>();
  total = input.required<number>();
  @Input() disabled = false;
  @Output() pageChange = new EventEmitter<number>();

  lastPage = computed(() => {
    const t = this.total();
    const s = this.pageSize();
    return Math.max(1, Math.ceil(t / Math.max(1, s)));
  });

  pages = computed(() => {
    const lp = this.lastPage();
    const arr: number[] = [];
    for (let i = 1; i <= lp; i++) {
      arr.push(i);
    }
    return arr;
  });

  go(p: number): void {
    const clamped = Math.min(Math.max(1, p), this.lastPage());
    if (clamped !== this.page()) {
      this.pageChange.emit(clamped);
    }
  }
}


