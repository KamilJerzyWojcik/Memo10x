<!-- 36ae9d5c-091d-4c4a-918b-0e9777e61e6d 174a32e8-807c-439b-a014-9b3fba9cbd08 -->
# Plan: POM wyłącznie dla AddCardPage i EditCardPage

## Zakres

- Tylko strony: `memo-words/src/pages/AddCardPage.tsx` i `memo-words/src/pages/EditCardPage.tsx`.
- Wspólny komponent POM: `CardFormPO` (używany wewnątrz obu stron).
- Opcjonalna baza: `BasePage` (nawigacja). Brak innych POM-ów dla stron/komponentów.

## Struktura katalogów

- `memo-words/e2e/page-objects/`
  - `base.page.ts`
  - `card-form.po.ts`
  - `add-card.page.ts`
  - `edit-card.page.ts`
- `memo-words/playwright.config.ts` (Chromium only, baseURL, webServer)

## Konfiguracja Playwright (skrót)

- Przeglądarka: Chromium (desktop).
- `use.baseURL = 'http://localhost:5173'`.
- `webServer`: uruchamia `npm run dev` w folderze `memo-words` z `port=5173`, `reuseExistingServer: true`.
- Trace: `on-first-retry`, screenshot/video: `only-on-failure`.

## Klasy POM

### 1) `base.page.ts`

- Cel: wspólne utilsy i nawigacja.
- API:
  - `async goto(path: string)` – przejście względne do ścieżki.

### 2) `card-form.po.ts` (CardFormPO)

- Cel: obsługa formularza z atrybutami `data-testid`.
- Selektory (getters):
  - `source` → `getByTestId('cardform-source')`
  - `sourceError` → `getByTestId('cardform-source-error')`
  - `sourceCount` → `getByTestId('cardform-source-count')`
  - `target` → `getByTestId('cardform-target')`
  - `targetError` → `getByTestId('cardform-target-error')`
  - `targetCount` → `getByTestId('cardform-target-count')`
  - `generate` → `getByTestId('cardform-generate')`
  - `generateSpinner` → `getByTestId('cardform-generate-spinner')`
  - `submit` → `getByTestId('cardform-submit')`
  - `cancel` → `getByTestId('cardform-cancel')`
- Metody:
  - `async typeSource(text: string)`
  - `async typeTarget(text: string)`
  - `async clickGenerate()` – klika i czeka aż spinner zniknie
  - `async submitForm()`
  - `async cancelForm()`
  - `async expectSourceError(msg: RegExp | string)` / `expectTargetError(...)`
  - `async expectCounts(src: number, tgt: number)`

Przykładowy szkielet:

```ts
import { Page, expect } from '@playwright/test';

export class CardFormPO {
  constructor(private readonly page: Page) {}
  get source() { return this.page.getByTestId('cardform-source'); }
  get generate() { return this.page.getByTestId('cardform-generate'); }
  get spinner() { return this.page.getByTestId('cardform-generate-spinner'); }
  async clickGenerate() { await this.generate.click(); await this.spinner.waitFor({ state: 'detached' }); }
  async submitForm() { await this.page.getByTestId('cardform-submit').click(); }
}
```

### 3) `add-card.page.ts` (AddCardPagePO)

- Ścieżka: `/cards/add`.
- API:
  - `async goto()` – przejście na stronę dodawania.
  - `form: CardFormPO` – kompozycja formularza.
  - `async createCardViaAI(source: string)` – wpisuje źródło, generuje, zapisuje.
  - `async createCardManual(source: string, target: string)` – wpisuje oba pola i zapisuje.
  - `async cancel()` – klik „Anuluj”.

### 4) `edit-card.page.ts` (EditCardPagePO)

- Ścieżka: `/cards/:id/edit`.
- API:
  - `async goto(id: string)` – przejście na stronę edycji.
  - `form: CardFormPO` – kompozycja formularza.
  - `async updateTarget(newText: string)` – zmiana i zapis tylko pola PL.
  - `async generateAndUpdate()` – użycie AI, walidacja i zapis.

## Kroki wdrożenia

1. Dodać `memo-words/playwright.config.ts` (Chromium-only, baseURL, webServer, trace/screenshot/video).
2. Utworzyć `base.page.ts` z metodą `goto`.
3. Utworzyć `card-form.po.ts` z selektorami i metodami opartymi o `data-testid`.
4. Utworzyć `add-card.page.ts` i `edit-card.page.ts`, kompozycja `CardFormPO`, minimalne metody flow.
5. (Poza zakresem) Dodać test(y) korzystające z POM (np. happy path add/edit) – dopiero po akceptacji planu.

### To-dos

- [ ] Skonfigurować Chromium-only playwright.config.ts z webServer/baseURL
- [ ] Dodać BasePage utils do nawigacji i wspólnych helperów
- [ ] Dodać CardFormPO z metodami generate/submit/validation
- [ ] Dodać AddCardPagePO (goto, create flows)
- [ ] Dodać EditCardPagePO (goto, update flow)
- [ ] Dodać CardsPagePO (goto, find item, highlight)
- [ ] Dodać CardListItemPO (edit/delete, confirm dialog)
- [ ] Dodać LoginPagePO (goto, signIn przez UI)
- [ ] (Opcjonalnie) Dodać ToastPO do asercji komunikatów