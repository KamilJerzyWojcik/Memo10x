import { Component, DestroyRef, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CardsQuery, PageSize } from '../api/dtos';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, distinctUntilChanged, Observable } from 'rxjs';
import { Paginator } from '../shared/paginator';
import { CardListItem } from './card-list-item';
import { EmptyState } from '../shared/empty-state';
import { LoadingSpinner } from '../shared/loading-spinner';
import { NotificationService } from '../core/notification.service';
import { NgStyle, AsyncPipe } from '@angular/common';
import { CardsPageStore, CardsStoreState } from './cards.page.store';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: PageSize = 10;
const PAGE_SIZES: PageSize[] = [10, 50, 100];

@Component({
  standalone: true,
  imports: [Paginator, CardListItem, EmptyState, LoadingSpinner, NgStyle, AsyncPipe],
  providers: [CardsPageStore],
  template: `
    <section class="cards-page">
      <div class="toolbar">
        <h1 class="title">Twoje karty</h1>
        <div class="spacer"></div>
        <label class="page-size">
          <span>Na stronę:</span>
          <select [value]="(queryParams$ | async)?.pageSize ?? 10" (change)="onPageSizeChange($any($event.target).value)">
            @for (s of pageSizes; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </label>
        <button type="button" class="btn primary" (click)="goAdd()">Dodaj</button>
      </div>

      @if ((state$ | async)?.loading) {
        <app-loading-spinner [show]="true" />
      }

      @if (((state$ | async)?.items?.length ?? 0) === 0 && !(state$ | async)?.loading) {
        <app-empty-state
          title="Brak kart"
          description="Dodaj pierwszą kartę, by rozpocząć naukę."
          actionLabel="Dodaj pierwszą kartę"
          (action)="goAdd()"
        />
      } @else {
        <div class="list" [ngStyle]="{ opacity: (state$ | async)?.loading ? 0.6 : 1 }">
          @for (c of (state$ | async)?.items ?? []; track c.id) {
            <app-card-list-item
              [card]="c"
              [confirming]="(((state$ | async)?.confirmingId ?? null) === c.id)"
              [busy]="!!((state$ | async)?.deletingIds?.has(c.id))"
              (edit)="goEdit($event)"
              (requestDelete)="showConfirm($event)"
              (confirmDelete)="confirmDelete($event)"
              (cancelDelete)="hideConfirm()"
            />
          }
        </div>

        <div class="paginator-wrap">
          <app-paginator
            [page]="(queryParams$ | async)?.page ?? 1"
            [pageSize]="(queryParams$ | async)?.pageSize ?? 10"
            [total]="(state$ | async)?.total ?? 0"
            [disabled]="!!((state$ | async)?.loading)"
            (pageChange)="onPageChange($event)"
          />
        </div>
      }
    </section>
  `,
  styles: [`
    .cards-page { padding: 1rem; max-width: 820px; margin: 0 auto; }
    .toolbar { display: flex; align-items: center; gap: .5rem; margin-bottom: 1rem; }
    .title { font-size: 1.25rem; margin: 0; }
    .spacer { flex: 1; }
    .page-size select { margin-left: .25rem; }
    .btn.primary { padding: .5rem .75rem; border-radius: .5rem; border: 1px solid #111827; background: #111827; color: #fff; }
    .list { display: grid; gap: .75rem; }
    .paginator-wrap { margin-top: .75rem; display: flex; justify-content: center; }
  `]
})
export class CardsPage {
  private readonly store = inject(CardsPageStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // Strumienie do widoku
  state$: Observable<CardsStoreState> = this.store.vm$;
  pageSizes = PAGE_SIZES;

  // Reaguj na zmiany query params (Observable, bez sygnałów)
  readonly queryParams$ = this.route.queryParamMap.pipe(
    map(params => {
      const page = Number(params.get('page') ?? DEFAULT_PAGE);
      const pageSize = Number(params.get('pageSize') ?? DEFAULT_PAGE_SIZE);
      return {
        page: Number.isFinite(page) && page >= 1 ? page : DEFAULT_PAGE,
        pageSize: (PAGE_SIZES as number[]).includes(pageSize) ? (pageSize as PageSize) : DEFAULT_PAGE_SIZE
      };
    }),
    distinctUntilChanged((a, b) => a.page === b.page && a.pageSize === b.pageSize)
  );

  // subskrypcja ładowania
  // eslint-disable-next-line @typescript-eslint/member-ordering
  private readonly _loadSub = this.queryParams$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(({ page, pageSize }) => this.store.load({ page, pageSize }));

  constructor() {
    this.store.invalidQuery$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const curPage = this.currentPage();
        const curSize = this.currentPageSize();
        if (curPage !== DEFAULT_PAGE || curSize !== DEFAULT_PAGE_SIZE) {
          this.notify.showError('Nieprawidłowe parametry listy. Przywracam domyślne.');
          this.replaceQuery({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE });
        } else {
          this.notify.showError('Nie udało się pobrać listy. Spróbuj ponownie.');
        }
      });
  }

  private currentPage(): number {
    const page = Number(this.route.snapshot.queryParamMap.get('page') ?? DEFAULT_PAGE);
    return Number.isFinite(page) && page >= 1 ? page : DEFAULT_PAGE;
  }

  private currentPageSize(): PageSize {
    const size = Number(this.route.snapshot.queryParamMap.get('pageSize') ?? DEFAULT_PAGE_SIZE);
    return (PAGE_SIZES as number[]).includes(size) ? (size as PageSize) : DEFAULT_PAGE_SIZE;
  }

  private navigateQuery(query: CardsQuery): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: query.page, pageSize: query.pageSize },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private replaceQuery(query: CardsQuery): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: query.page, pageSize: query.pageSize },
      replaceUrl: true
    });
  }

  onPageChange(p: number): void {
    this.navigateQuery({ page: p, pageSize: this.currentPageSize() });
  }

  onPageSizeChange(val: string): void {
    const next = Number(val) as PageSize;
    if ((PAGE_SIZES as number[]).includes(next)) {
      this.navigateQuery({ page: DEFAULT_PAGE, pageSize: next });
    } else {
      this.navigateQuery({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE });
    }
  }

  showConfirm(id: string): void {
    this.store.setConfirmingId(id);
  }

  hideConfirm(): void {
    this.store.setConfirmingId(null);
  }

  confirmDelete(id: string): void {
    this.store.deleteCard(id);
  }

  goAdd(): void {
    this.router.navigate(['/cards', 'new']);
  }

  goEdit(id: string): void {
    this.router.navigate(['/cards', id, 'edit']);
  }
}


