<!-- 2836f11d-fe2e-4814-8897-ecef4dfb9e34 74e44980-31f5-409f-a18e-77821f8ac9d2 -->
# Plan implementacji widoku Dodawanie karty

## 1. Przegląd

Widok pełnoekranowy do utworzenia nowej karty (EN → PL) z opcjonalnym użyciem AI do generowania tłumaczenia. Zawiera dwa pola tekstowe (`sourceText`, `targetText`), walidację długości (1..500 po przycięciu), przycisk „Generuj” z blokadą edycji `targetText` podczas żądania, komunikaty błędów (429/502/504) z akcją „Ponów”, oraz „Dodaj”/„Anuluj”. Po sukcesie przekierowuje do `/cards?page=1` (opcjonalnie z oznaczeniem nowej karty do wyróżnienia w liście).

## 2. Routing widoku

- Ścieżka: `/cards/add` (kanoniczna)
- Alias: `/cards/new` → redirect do `/cards/add` (dla zgodności z istniejącym `CardsToolbar`)
- Plik: `memo-words/src/router.tsx` – dodanie trasy z komponentem `AddCardPage` oraz wpisu redirect dla `/cards/new`

## 3. Struktura komponentów

- `pages/AddCardPage.tsx`
  - Orkiestruje stan formularza, wywołania API, nawigację i focus management
  - Renderuje `CardForm` i przekazuje callbacki oraz stany
- `components/CardForm.tsx`
  - Prezentacyjny formularz: pola `sourceText`, `targetText`, przyciski `AiGenerateButton`, „Dodaj”, „Anuluj”; liczniki znaków i komunikaty walidacji
- `components/AiGenerateButton.tsx`
  - Przycisk „Generuj” ze spinnerem; disabled podczas żądania
- Reuse: `components/LoadingSpinner.tsx`, `components/ToastProvider.tsx`

Drzewo (wysoki poziom):

- AddCardPage
  - CardForm
    - AiGenerateButton
  - LoadingSpinner (globalny, warstwowy)

## 4. Szczegóły komponentów

### AddCardPage

- Opis: Widok stanu i logiki. Zapewnia walidację, integrację API, zarządzanie focus i nawigacją.
- Główne elementy:
  - Nagłówek „Dodaj kartę” (h1)
  - `CardForm` z kontrolowanymi wartościami i callbackami
  - `LoadingSpinner` (pokazuje globalny busy przy submit)
- Obsługiwane interakcje:
  - Zmiana `sourceText`/`targetText`
  - `onGenerate` (AI): blokuje edycję `targetText`, pokazuje spinner w przycisku; po 200 wstawia tłumaczenie i focus na `targetText`
  - `onSubmit`: walidacja → POST `/api/v1/cards` → redirect `/cards?page=1` (opcjonalnie z `highlightId` w `state` lub query)
  - `onCancel`: nawigacja do `/cards?page=1`
- Walidacja:
  - `sourceText` i `targetText`: `trim().length` w zakresie 1..500
  - „Dodaj” aktywne tylko gdy oba pola są ważne i nie trwa submit
- Typy: `AddCardViewModel`, `CreateCardRequest`, `CardDto`, `TranslateRequest`, `TranslateResponse`
- Propsy: brak (strona)

### CardForm

- Opis: Czysty komponent formularza; nie wywołuje fetchy.
- Główne elementy:
  - Label + `textarea` dla `sourceText` (EN) i `targetText` (PL)
  - Licznik znaków i komunikat walidacji pod każdym polem
  - `AiGenerateButton` obok `targetText` (lub nad nim) z opisem
  - Przyciski „Dodaj” (primary) i „Anuluj” (tertiary)
- Interakcje:
  - `onSourceChange`, `onTargetChange`, `onGenerate`, `onSubmit`, `onCancel`
- Walidacja:
  - Przekazywana w props jako `errors.sourceText`/`errors.targetText`
- Typy: `CardFormProps` (patrz niżej)
- Propsy (interfejs):
  - `sourceText: string`
  - `targetText: string`
  - `errors: { sourceText?: string; targetText?: string }`
  - `generating: boolean`
  - `disableTargetWhileGenerating?: boolean` (domyślnie true)
  - `submitting: boolean`
  - `onSourceChange(value: string): void`
  - `onTargetChange(value: string): void`
  - `onGenerate(): void`
  - `onSubmit(): void`
  - `onCancel(): void`

### AiGenerateButton

- Opis: Przycisk „Generuj” z wbudowanym spinnerem i aria-live
- Interakcje: `onClick`
- Walidacja: disabled gdy `sourceText` nieważny lub trwa generowanie
- Propsy:
  - `loading: boolean`
  - `disabled?: boolean`
  - `onClick(): void`

## 5. Typy

- TS w `memo-words/src/types/cards.ts` (rozszerzenia) i ewentualnie `types/ai.ts`:
```ts
// cards.ts
export interface CreateCardRequest { sourceText: string; targetText: string; }

// ai.ts (nowy plik)
export interface TranslateRequest { sourceText: string; model?: string }
export interface TranslateResponse { translation: string }

// Widok
export type GenerateState = 'idle' | 'loading' | 'error';
export interface AddCardViewModel {
  sourceText: string;
  targetText: string;
  errors: { sourceText?: string; targetText?: string };
  generateState: GenerateState;
  aiErrorStatus?: 429 | 502 | 504 | 500; // do mapowania komunikatu i przycisku Ponów
  submitting: boolean;
}
```


## 6. Zarządzanie stanem

- Custom hook `useAddCardViewModel` w `pages/AddCardPage.tsx` lub `hooks/useAddCardViewModel.ts`:
  - Stan: `sourceText`, `targetText`, `errors`, `generateState`, `aiErrorStatus`, `submitting`
  - Funkcje:
    - `validateField(name, value)` i `validateAll()` (1..500 po `trim()`)
    - `generate()`: jeżeli `sourceText` ważny i nie trwa generowanie → POST AI, ustaw `generateState='loading'`, zablokuj `targetText`; po 200: ustaw `targetText`, `generateState='idle'`, focus na `targetText`; po 429/502/504: `generateState='error'`, `aiErrorStatus` ustaw, pokaż toast z `Ponów`
    - `submit()`: jeżeli oba pola ważne → `submitting=true`, POST `/api/v1/cards`, po 201 redirect `/cards?page=1` (opcjonalnie z `state: { highlightId }`)
    - `cancel()`: nawigacja `/cards?page=1`
  - Ochrona przed wyścigiem: `requestIdRef` – inkrementowane przy każdym generate; ignoruj odpowiedzi z nieaktualnym id
  - `AbortController` na unmount (opcjonalnie)

## 7. Integracja API

- Autoryzacja: zapewnia `apiClient` (nagłówek `Authorization: Bearer <token>`); 401 → redirect do `/login` (już zaimplementowane)
- Wywołania:
  - `POST /api/v1/cards`
    - Request: `CreateCardRequest`
    - Response: `CardDto`
    - Błędy: 400 (walidacja), 401
  - `POST /api/v1/ai/translate`
    - Request: `TranslateRequest` (wykorzystujemy tylko `sourceText`)
    - Response: `TranslateResponse`
    - Błędy: 400, 401, 429, 502, 504
- Implementacja usług:
  - `services/cardsApi.ts`: dodać `createCard(payload: CreateCardRequest): Promise<CardDto>`
  - `services/aiApi.ts` (nowy): `translate(req: TranslateRequest): Promise<TranslateResponse>`

## 8. Interakcje użytkownika

- Wprowadzenie `sourceText` i opcjonalnie kliknięcie „Generuj” → spinner w przycisku, zablokowane `targetText` → po sukcesie `targetText` uzupełnione i dostępne do edycji
- Możliwość wielokrotnej regeneracji (sekwencyjnie; równoległych żądań nie dopuszczamy)
- Ręczne uzupełnienie bez AI – „Dodaj” aktywne, gdy pola ważne
- „Anuluj” – powrót do listy bez zapisu

## 9. Warunki i walidacja

- `sourceText`: `trim().length` w [1, 500]
- `targetText`: `trim().length` w [1, 500]
- `AiGenerateButton`: disabled gdy `generateState='loading'` lub `sourceText` nieważny
- `targetText` pole: `readOnly` (lub `disabled`) gdy `generateState='loading'`
- `Submit` (Dodaj): disabled gdy są błędy walidacji lub `submitting`

## 10. Obsługa błędów

- AI (429): toast `warning` „Zbyt wiele żądań. Spróbuj ponownie.” + akcja „Ponów” → wywołuje `generate()`
- AI (502): toast `error` „Błąd usługi AI. Spróbuj ponownie.” + „Ponów”
- AI (504): toast `error` „Przekroczono limit czasu. Spróbuj ponownie.” + „Ponów”
- Sieć/inne (AI): toast `error` „Błąd sieci. Spróbuj ponownie.” + „Ponów”
- Zapis 400: toast `warning` „Nieprawidłowe dane. Sprawdź pola.” i focus na pierwszy błąd
- Zapis 5xx/sieć: toast `error` „Nie udało się zapisać. Spróbuj ponownie.” + „Ponów” (retry submit)
- 401: przejęte przez `apiClient` → redirect `/login`

## 11. Kroki implementacji

1. Typy

   - Rozszerz `types/cards.ts` o `CreateCardRequest`
   - Dodaj `types/ai.ts` z `TranslateRequest`, `TranslateResponse`

2. Serwisy API

   - `cardsApi.ts`: dodaj `createCard`
   - `aiApi.ts` (nowy): dodaj `translate`

3. Routing

   - `router.tsx`: dodaj `path: '/cards/add'` → `AddCardPage`
   - Dodaj redirect z `/cards/new` do `/cards/add`
   - `CardsPage.tsx`: w `CardsToolbar` akcję `onAdd` ustaw na `/cards/add`

4. Widok i hook

   - Utwórz `pages/AddCardPage.tsx` z hookiem `useAddCardViewModel`

5. Komponenty

   - Utwórz `components/CardForm.tsx` i `components/AiGenerateButton.tsx`

6. Walidacja i UX

   - Implementuj liczniki znaków, focus na pierwszym błędzie, focus na `targetText` po sukcesie AI

7. Obsługa błędów

   - Mapowanie statusów 429/502/504 do treści toastów z akcją „Ponów”

8. Nawigacja po zapisie

   - Redirect do `/cards?page=1`, opcjonalnie z `state: { highlightId }` (do wykorzystania w liście w osobnym zadaniu)

9. Testy manualne

   - Ścieżki: ręczne dodanie, z AI, wielokrotne generowanie, błędy 429/502/504, anulowanie, 401

### To-dos

- [ ] Dodać CreateCardRequest i nowe typy AI w TS
- [ ] Dodać createCard do cardsApi i nowy aiApi.translate
- [ ] Dodać trasę /cards/add i redirect z /cards/new
- [ ] Utworzyć AddCardPage z hookiem useAddCardViewModel
- [ ] Zaimplementować CardForm (pola, walidacja, przyciski)
- [ ] Zaimplementować AiGenerateButton ze spinnerem
- [ ] Zaimplementować mapowanie statusów do toastów
- [ ] Po 201 redirect do /cards?page=1 z opcjonalnym highlight
- [ ] Przeprowadzić testy manualne ścieżek i błędów