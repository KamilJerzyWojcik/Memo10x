import { Injectable, inject } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { CardsApiService } from '../api/cards-api.service';
import { CardDto, CardsPageState, CardsQuery, PageSize, PagedResultDto } from '../api/dtos';
import { NotificationService } from '../core/notification.service';
import { Subject, switchMap, tap } from 'rxjs';

export interface CardsStoreState extends CardsPageState {
  confirmingId: string | null;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE: PageSize = 10;

const initialState: CardsStoreState = {
  items: [],
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  hasNextPage: false,
  loading: false,
  deletingIds: new Set<string>(),
  confirmingId: null
};

@Injectable()
export class CardsPageStore extends ComponentStore<CardsStoreState> {
  private readonly api = inject(CardsApiService);
  private readonly notify = inject(NotificationService);

  readonly invalidQuery$ = new Subject<void>();

  // expose full state as VM
  readonly vm$ = this.state$;

  constructor() {
    super(initialState);
  }

  readonly setConfirmingId = this.updater<string | null>((state, id) => ({
    ...state,
    confirmingId: id
  }));

  readonly addDeleting = this.updater<string>((state, id) => {
    const next = new Set(state.deletingIds);
    next.add(id);
    return { ...state, deletingIds: next };
  });

  readonly removeDeleting = this.updater<string>((state, id) => {
    const next = new Set(state.deletingIds);
    next.delete(id);
    return { ...state, deletingIds: next };
  });

  readonly removeCardLocal = this.updater<string>((state, id) => {
    const items = state.items.filter(i => i.id !== id);
    const total = Math.max(0, state.total - 1);
    return { ...state, items, total };
  });

  readonly load = this.effect<CardsQuery>((params$) =>
    params$.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap((query) =>
        this.api.getCards(query).pipe(
          tapResponse({
            next: (res: PagedResultDto<CardDto>) => {
              this.patchState({
                items: res.items,
                page: res.page,
                pageSize: res.pageSize as PageSize,
                total: res.total,
                hasNextPage: res.hasNextPage,
                loading: false
              });
            },
            error: (err) => {
              this.patchState({ loading: false });
              if (err?.status === 400) {
                this.invalidQuery$.next();
              } else {
                this.notify.showError('Nie udało się pobrać listy. Spróbuj ponownie.');
              }
            }
          })
        )
      )
    )
  );

  readonly deleteCard = this.effect<string>((ids$) =>
    ids$.pipe(
      tap((id) => this.addDeleting(id)),
      switchMap((id) =>
        this.api.deleteCard(id).pipe(
          tapResponse({
            next: () => {
              this.removeCardLocal(id);
              this.removeDeleting(id);
              this.setConfirmingId(null);
            },
            error: (err) => {
              this.removeDeleting(id);
              if (err?.status === 404) {
                this.notify.showError('Karta nie istnieje. Odświeżam.');
                const { page, pageSize } = this.get();
                this.load({ page, pageSize: pageSize as PageSize });
              } else {
                this.notify.showError('Nie udało się usunąć. Spróbuj ponownie.');
              }
            }
          })
        )
      )
    )
  );
}


