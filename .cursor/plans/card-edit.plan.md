<!-- b70bdcf1-ca6a-4c02-9ea1-34ca6ec70cee 4580be00-d60a-4ba4-a4a4-063d0fa1c2d0 -->
# Plan implementacji widoku Edycja karty

## 1. Przegląd

Widok umożliwia edycję istniejącej karty: zmianę pól sourceText i/lub targetText, z opcjonalną regeneracją tłumaczenia przez AI. Po zapisie użytkownik wraca do listy kart (`/cards`) i odpowiednia karta zostaje podświetlona (przez `state.highlightId`). Błędy (w tym 404) są prezentowane w toście; 404 powoduje powrót do listy.

## 2. Routing widoku

- Ścieżka: `/cards/:id/edit`
- Router: React Router v6
- Powrót po sukcesie/anulowaniu: na `/cards` z `{ state: { highlightId: <id> } }` (bez query stringów – zgodnie z aktualną logiką `CardsPage.tsx`)

## 3. Struktura komponentów

Drzewo komponentów:

- **EditCardPage** (`memo-words/src/pages/EditCardPage.tsx`)
- Nagłówek „Edycja karty”
- @if `loading` → **LoadingSpinner**
- **Toast** (globalny przez `ToastProvider`)
- **CardForm** (tryb edycji; reuse istniejącego `CardForm`)
- Pola tekstowe `sourceText`, `targetText` (walidacja 1..500)
- **AiGenerateButton** (spinner; blokada edycji `targetText` w trakcie)
- Stopka akcji: „Zapisz”, „Anuluj”

## 4. Szczegóły komponentów

### EditCardPage

- **Opis**: Widok routowany. Pobiera kartę (najpierw próbuje z `location.state.card`, w przeciwnym razie GET `/api/v1/cards/{id}`), zarządza stanami (loading, submitting, generateState, errors), obsługuje zapis (PATCH) i nawigację do `/cards`.
- **Główne elementy**: `CardForm`, `AiGenerateButton`, `LoadingSpinner`, `Toast`.
- **Obsługiwane interakcje**:
- mount → wczytaj `card` z `location.state.card` lub z API
- Zmiana pól → walidacja inline 1..500
- „Generuj” (AI) → blokada `targetText`, spinner; po sukcesie podstaw tłumaczenie
- „Zapisz” → PATCH tylko zmienionych pól; toast sukcesu; powrót na listę z `highlightId`
- „Anuluj” → nawigacja na `/cards`
- **Walidacja**: `sourceText.trim()` i `targetText.trim()` w zakresie [1, 500]; przy błędach wyłącz „Zapisz” + komunikaty pod polami.
- **Typy**: `CardDto` (z `src/types/cards`), `UpdateCardRequest`, lokalne `GenerateState`, `FormErrors`.
- **Propsy**: komponent routowany (korzysta z `useParams`, `useLocation`, `useNavigate`).

### CardForm (reuse `src/components/CardForm.tsx`)

- **Opis**: Prezentuje i waliduje pola, emituje zmiany i submit; interfejs identyczny jak w `AddCardPage`.
- **Główne elementy**: `<form>`, 2 pola tekstowe, komunikaty błędów, obszar akcji.
- **Interakcje**: `onSourceChange`, `onTargetChange`, `onGenerate`, `onSubmit`, `onCancel`.
- **Walidacja**: 1..500 po `trim` dla obu pól.
- **Typy**: `FormErrors`.
- **Propsy (takie jak w AddCardPage)**:
- `sourceText`, `targetText`
- `errors`, `generating`, `submitting`
- `disableTargetWhileGenerating`
- `onSourceChange`, `onTargetChange`, `onGenerate`, `onSubmit`, `onCancel`
- `sourceRef`, `targetRef`, `sourceCount`, `targetCount`, `maxLen`
- `GenerateButton={AiGenerateButton}`

### AiGenerateButton (reuse `src/components/AiGenerateButton.tsx`)

- **Opis**: Wywołuje AI (`translate`) z `sourceText` i zwraca `translation`.
- **Interakcje**: `onClick` → stan `loading`; `onGenerated(translation)`; `onError`.
- **Warunki**: `disabled` przy pustym `sourceText` lub gdy żądanie w toku.

### LoadingSpinner

- **Opis**: Indykator ładowania dla GET i PATCH/AI.

## 5. Typy

- Reuse istniejących typów z `src/types/cards`:
- `CardDto`, `PagedResultDto`, `PageSize` (już używane w `CardsPage.tsx`)
- Nowe/uzupełnione typy (FE):
- `UpdateCardRequest`:
- `sourceText?: string`
- `targetText?: string`
- Lokalne w `EditCardPage.tsx`:
- `type GenerateState = 'idle' | 'loading' | 'error'`
- `type FormErrors = { sourceText?: string; targetText?: string }`

## 6. Zarządzanie stanem

- Wzorowane na `AddCardPage.tsx` (prosta, czytelna architektura bez customowych hooków):
- `sourceText`, `targetText`, `errors`, `generateState`, `submitting`, `loading`
- `requestIdRef` do rozróżniania odpowiedzi AI
- `acRef` (`AbortController`) do przerywania trwających żądań AI przy kolejnych żądaniach/unmount
- `sourceRef`, `targetRef` do zarządzania fokusem
- `initial` referencja na wczytaną kartę do obliczania „dirty” (porównanie po `trim`)
- Przycisk „Zapisz” włączony tylko, gdy brak błędów i nastąpiła zmiana względem `initial`.

## 7. Integracja API

- **GET `/api/v1/cards/{id}`** → `CardDto`
- 200: wypełnia formularz, `loading=false`
- 404: toast „Karta nie istnieje lub została usunięta”, `navigate('/cards')`
- 401: toast „Sesja wygasła – zaloguj się ponownie”
- **PATCH `/api/v1/cards/{id}`** body: `UpdateCardRequest` (wysyłamy tylko zmienione pola)
- 200: zwraca zaktualizowany `CardDto` (użyj `updatedAt` do ewentualnego komunikatu)
- 400: pokaż błędy (toast + wskazanie pól)
- 404: toast + powrót na listę
- 401/5xx: toast błędu z opcją ponowienia
- **AI**: `translate({ sourceText })` (reuse z `AddCardPage.tsx` przez `services/aiApi.ts`)
- Klient API (`src/services/cardsApi.ts`):
- `getCard(id: string): Promise<CardDto>`
- `updateCard(id: string, body: UpdateCardRequest): Promise<CardDto>`

## 8. Interakcje użytkownika

- Wejście na `/cards/:id/edit`: pokaż spinner; wczytaj kartę (z `location.state.card` lub z API).
- Edycja pól: walidacja inline; licznik znaków (jak w AddCardPage).
- „Generuj”: walidacja `sourceText` → AI; blokada `targetText` i spinner; po sukcesie nadpisz `targetText`, fokus w `target`.
- „Zapisz”: jeśli brak błędów i są zmiany → PATCH; sukces: toast i `navigate('/cards', { state: { highlightId: id } })`.
- „Anuluj”: `navigate('/cards')`.

## 9. Warunki i walidacja

- `MIN_LEN=1`, `MAX_LEN=500` (spójnie z `AddCardPage.tsx`)
- Walidacja obu pól po `trim()`
- `AiGenerateButton` disabled przy pustym `sourceText` lub gdy `generateState==='loading'`.
- `Zapisz` disabled, gdy: są błędy, `submitting`, `generateState==='loading'`, lub brak zmian względem `initial`.

## 10. Obsługa błędów

- GET 404 → toast ostrzegawczy + powrót do `/cards`.
- 401 (GET/PATCH) → toast o wygaśniętej sesji; opcjonalnie redirect do logowania wg globalnych zasad.
- 400 (PATCH) → mapuj błędy do pól + toast „Popraw dane formularza”.
- 5xx / sieć → toast z akcją „Ponów”.
- AI: 429/502/504/unknown → komunikaty jak w `AddCardPage.tsx`, zachowanie pól i możliwość ponowienia; abort przy unmount.

## 11. Kroki implementacji

1. Dodać trasę `/cards/:id/edit` w konfiguracji routera (analogicznie do `AddCardPage`).
2. Dodać w `src/services/cardsApi.ts`: `getCard` (GET) i `updateCard` (PATCH) + typ `UpdateCardRequest` w `src/types/cards.ts`.
3. Utworzyć `src/pages/EditCardPage.tsx` (wg wzorca `AddCardPage.tsx`): stany, refs, walidacja 1..500, liczniki, obsługa spinnerów.
4. Inicjalizacja danych: użyj `location.state.card` jeśli obecne; w przeciwnym razie wykonaj GET; w 404 → toast + nawigacja `/cards`.
5. Integracja formularza: podłącz `CardForm` (te same propsy co w Add); podaj `GenerateButton={AiGenerateButton}` i `disableTargetWhileGenerating`.
6. Implementacja AI: kopiuj logikę `generate` z `AddCardPage.tsx` (z `AbortController`, `requestIdRef`, obsługa błędów przez `ApiError`).
7. Zapis: porównaj z `initial` po `trim`; zbuduj `UpdateCardRequest` tylko ze zmienionych pól; PATCH; toast sukcesu; `navigate('/cards', { replace: true, state: { highlightId: id } })`.
8. Ulepszyć `CardsPage.tsx`: w `onEdit` przekazać bieżący obiekt `card` w `location.state` (np. `navigate(..., { state: { card } })`) – skraca TTFB dla edycji.
9. Testy: walidacja 1..500; budowa `UpdateCardRequest`; scenariusz 404; reakcja na błędy AI; włączenie/wyłączenie przycisku „Zapisz”.

### To-dos

- [ ] Dodać trasę /cards/:id/edit w routerze
- [ ] Dodać getCard i updateCard w cardsApi oraz UpdateCardRequest
- [ ] Utworzyć EditCardPage z inicjalnym ładowaniem i spinnerem
- [ ] Wczytać kartę z location.state.card lub GET z API (404→back)
- [ ] Wpiąć CardForm w trybie edycji jak w AddCardPage
- [ ] Podłączyć AiGenerateButton i logikę generate z AddCardPage
- [ ] Zaimplementować PATCH tylko zmienionych pól i navigate z highlight
- [ ] Przekazać card w navigate state z CardsPage.onEdit
- [ ] Dodać testy: walidacja, build patch, 404, AI błędy, disabled