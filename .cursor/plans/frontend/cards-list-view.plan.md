<!-- 0f5951e5-5d9a-4501-8aea-a0c3f9c4121b 66a20df8-b3de-46b4-b5f7-e04d3fa09280 -->
# Plan implementacji widoku Lista kart

## 1. Przegląd

Widok „Lista kart” prezentuje karty bieżącego użytkownika w kolejności malejącej po `createdAt` z paginacją,

możliwością zmiany rozmiaru strony (10/50/100), nawigacją do dodawania/edycji oraz twardym usunięciem z

potwierdzeniem inline. Stan paginacji jest synchronizowany z parametrami zapytania w URL.

Błędy 401 skutkują przekierowaniem do `/login`, pozostałe błędy sygnalizujemy przez toast z opcją ponowienia.

## 2. Routing widoku

- Ścieżka: `/cards`
- Query params: `page` (domyślnie 1, min 1), `pageSize` (10|50|100, domyślnie 10)
- Guard: wymagana sesja (Supabase); 401 -> redirect do `/login`

## 3. Struktura komponentów

- `AppHeader` (globalny, wspólny)
- `CardsPage` (widok routowany)
  - `Toolbar` (w ramach `CardsPage`): przyciski „Dodaj” i selektor `pageSize`
  - `CardList` (sekcja w `CardsPage`)
    - `CardListItem` × N (akcje: Edytuj, Usuń)
      - `ConfirmModal` (pokazywany po kliknięciu Usuń)
  - `Paginator` (przełączanie stron)
  - `EmptyState` (gdy brak elementów)
  - `Toast` (usługa globalna)
  - `LoadingSpinner` (nakładka podczas ładowania)

## 4. Szczegóły komponentów

### CardsPage (standalone)

- Opis: Kontener widoku. Odpowiada za pobieranie danych, synchronizację z URL, zarządzanie stanem (sygnały), przekazywanie akcji do API i obsługę błędów.
- Główne elementy: nagłówek sekcji, pasek narzędzi (Dodaj, pageSize), lista kart, paginator, empty state, spinner.
- Interakcje: zmiana `page`, `pageSize`, klik „Dodaj”, klik „Edytuj” (nawigacja), klik „Usuń” (otwiera `ConfirmModal`).
- Walidacja: `page >= 1`; `pageSize ∈ {10,50,100}`; przy zmianie `pageSize` ustaw `page = 1`.
- Typy: `CardDto`, `PagedResultDto<CardDto>`, `CardsQuery`, `CardsPageState`.
- Propsy: (widok routowany, odbiera stan z routera; nie przyjmuje propsów z rodzica).

### Paginator (standalone)

- Opis: Kontrolka paginacji z numerami stron, „Poprzednia/Następna”, wsparcie dla dużych ekranów i dostępności.
- Elementy: lista przycisków stron, przyciski „<” i „>”, selektor rozmiaru strony może być osobno w toolbarze.
- Zdarzenia: `pageChange(number)`, opcjonalnie `pageSizeChange(number)` jeśli używana wersja z selektorem.
- Walidacja: docelowa strona w zakresie `[1, lastPage]`.
- Typy: `PaginatorInput` { page, pageSize, total }, `PageSize` (10|50|100).
- Propsy: `{ page: number; pageSize: PageSize; total: number; disabled?: boolean }`.

### CardListItem (standalone)

- Opis: Prezentuje pojedynczą kartę (source/target/createdAt/updatedAt) i akcje: Edytuj, Usuń z potwierdzeniem inline.
- Elementy: teksty, znaczniki czasu (sformatowane), przyciski „Edytuj”, „Usuń”, `ConfirmModal` (pokazywany warunkowo).
- Zdarzenia: `edit(id)`, `requestDelete(id)`, `confirmDelete(id)`, `cancelDelete(id)`.
- Walidacja: brak dodatkowej walidacji (dane są tylko wyświetlane); przy `confirmDelete` blokada przycisku w trakcie żądania.
- Typy: `CardDto`, opcjonalnie `CardListItemViewModel` (np. z polami sformatowanych dat).
- Propsy: `{ card: CardDto; busy?: boolean }`.

### ConfirmModal (standalone)

- Opis: Modal potwierdzenia „Tej operacji nie można cofnąć.” bez modala.
- Elementy: treść, przyciski „Anuluj” i „Tak, usuń”.
- Zdarzenia: `confirm()`, `cancel()`.
- Walidacja: niedostępne przyciski gdy ``.
- Propsy: `{ message: string; confirmLabel?: string; cancelLabel?: string; busy?: boolean }`.

### EmptyState (standalone)

- Opis: Informuje o braku kart. Przyciski CTA do dodania pierwszej karty.
- Elementy: ikona/ilustracja, komunikat, przycisk „Dodaj pierwszą kartę”.
- Zdarzenia: `addClick()` -> nawigacja do dodawania.
- Walidacja: brak.
- Propsy: `{ title: string; description?: string; actionLabel?: string }`.

### LoadingSpinner (standalone lub globalny)

- Opis: Nakładka ładowania dla asynchronicznych operacji listy.
- Propsy: `{ show: boolean }`.

## 5. Typy

Proponowane interfejsy TS dla zgodności z API i widokiem:

```ts
export type PageSize = 10 | 50 | 100;

export interface CardDto {
  id: string;
  sourceText: string;
  targetText: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface PagedResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}

export interface CardsQuery {
  page: number;
  pageSize: PageSize;
}

export interface CardsPageState {
  items: CardDto[];
  page: number;
  pageSize: PageSize;
  total: number;
  hasNextPage: boolean;
  loading: boolean;
  deletingIds: Set<string>;
}
```

Opcjonalny VM (lokalnie w `CardListItem`):

```ts
export interface CardListItemViewModel extends CardDto {
  createdAtLabel: string;
  updatedAtLabel: string;
}
```

## 6. Zarządzanie stanem

- Sygnały w `CardsPage`:
  - `page`, `pageSize` (źródło prawdy: URL query -> sygnały; aktualizacja routera na zmiany)
  - `state` (sygnał obiektu `CardsPageState`)
  - `loading` (bool), `deletingIds` (Set<string>)
- `effect`: reaguje na zmiany `page/pageSize` i wywołuje `load()` z anulowaniem poprzednich żądań (RxJS `switchMap`).
- Aktualizacja URL: `router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true })`.
- Zmiana `pageSize` resetuje `page=1`.

## 7. Integracja API

- Autoryzacja: `Authorization: Bearer <token>` (Supabase). Zapewnić globalny `HttpInterceptor` lub wstrzyknięty `AuthService` dostarczający token.
- Endpoints:
  - GET `/api/v1/cards?page={page}&pageSize={pageSize}`
    - Sukces: `PagedResultDto<CardDto>`
    - 400: toast „Nieprawidłowe parametry listy” + przycisk „Przywróć domyślne” (ustaw `page=1`, `pageSize=10`)
    - 401: redirect `/login`
  - DELETE `/api/v1/cards/{id}`
    - Sukces: 204 (usunąć element z `items`, `total--`)
    - 404: toast „Karta nie istnieje. Odświeżono.” + ponowne pobranie strony
    - 5xx: toast „Nie udało się usunąć. Spróbuj ponownie.”

Serwis:

```ts
getCards(query: CardsQuery): Observable<PagedResultDto<CardDto>>
deleteCard(id: string): Observable<void>
```

## 8. Interakcje użytkownika

- Zmiana strony (Paginator) -> aktualizacja `page` w URL -> fetch.
- Zmiana rozmiaru strony (Toolbar) -> `pageSize` w URL, `page=1` -> fetch.
- Klik „Dodaj” -> nawigacja do `/cards/new`.
- Klik „Edytuj” -> nawigacja do `/cards/:id/edit`.
- Klik „Usuń” -> pokaż `ConfirmInline` w `CardListItem`.
- Potwierdzenie usunięcia -> `DELETE` + blokada przycisków; sukces usuwa element; jeśli lista pusta i `page>1`, opcjonalnie pokaż sugestię powrotu na poprzednią stronę (bez auto-nawigacji).

## 9. Warunki i walidacja

- `page` z URL: jeśli brak/NaN/<1 -> `1`.
- `pageSize` z URL: jeśli brak/nie w {10,50,100} -> `10`.
- Nie koryguj „za wysokiej” `page` automatycznie; pokazuj pustą stronę z informacją i przyciskami paginacji.
- W komponentach blokuj akcje podczas `loading`/`deleting`.
- Formatowanie dat przez pipe (np. `date:'short'`) lub preformat w VM.

## 10. Obsługa błędów

- 401: globalny interceptor -> `/login` (z zachowaniem docelowego URL w query `returnUrl`).
- 400: toast + opcja przywrócenia domyślnych parametrów.
- 404 przy DELETE: toast + `reload()`.
- 5xx/Network: toast + przycisk „Ponów”. W trakcie ponawiania spinner.
- Timeout: anulowanie poprzednich żądań (switchMap), UI pozostaje responsywny.
- Telemetria: `delete_confirmed` przy sukcesie usunięcia; `list_viewed` przy pierwszym renderze (opcjonalnie).

## 11. Kroki implementacji

1. Dodaj routing do `/cards` (standalone route, guard auth).
2. Zdefiniuj typy TS (`CardDto`, `PagedResultDto`, `PageSize`, `CardsQuery`, `CardsPageState`).
3. Utwórz `CardsApiService` z metodami `getCards`, `deleteCard` i integracją z `HttpClient`.
4. Zapewnij `AuthInterceptor` (jeśli brak) do dołączania `Authorization`.
5. Zaimplementuj `CardsPage` (sygnały, effect, URL sync, toolbar, spinner, toast, obsługa błędów).
6. Zaimplementuj `Paginator` i podłącz do `CardsPage`.
7. Zaimplementuj `CardListItem` + `ConfirmInline` (blokady, zdarzenia, a11y).
8. Zaimplementuj `EmptyState` i logikę wyświetlania przy pustej liście.
9. Obsłuż usuwanie: zaznaczenie `deletingIds`, wywołanie API, aktualizacja listy/`total`, toasty, telemetry.
10. Testy manualne: scenariusze US-005/US-006, 401/400/5xx, pusta lista, usunięcie.
11. Drobne poprawki mobilne (rozmiary dotykowe ≥44px, responsywne odstępy).

### To-dos

- [ ] Dodać trasę /cards z guardem autoryzacji
- [ ] Zdefiniować TS typy: CardDto, PagedResultDto, PageSize, CardsQuery, CardsPageState
- [ ] Utworzyć CardsApiService z getCards i deleteCard
- [ ] Zapewnić HttpInterceptor do nagłówka Authorization
- [ ] Zaimplementować komponent CardsPage z sygnałami i URL sync
- [ ] Zaimplementować komponent Paginator z obsługą pageChange
- [ ] Zaimplementować CardListItem i ConfirmInline (potwierdzenie usunięcia)
- [ ] Zaimplementować EmptyState i logikę wyświetlania
- [ ] Podłączyć usuwanie: blokady, API, odświeżenie, toasty, telemetry
- [ ] Wykonać testy scenariuszy US-005/US-006 i błędów