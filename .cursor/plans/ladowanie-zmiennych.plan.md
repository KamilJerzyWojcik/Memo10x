<!-- 338cc705-49f1-4b97-a467-9fc48e20a185 58801c64-e166-49fe-bc70-e0b1ac62729a -->
# Wdrożenie ładowania .env dla Playwright i global-setup

### Cel

Zapewnić, że global-setup i testy E2E czytają dane logowania z `memo-words/.env`, bez konieczności ustawiania zmiennych ręcznie w shellu.

### Krok 1: Instalacja dotenv

- W katalogu `memo-words/` zainstaluj:
```bash
npm i -D dotenv
```


### Krok 2: Załaduj .env w Playwright config

Plik: `memo-words/playwright.config.ts`

- Dodaj jako pierwszy import:
```ts
import 'dotenv/config'
```

- (Opcjonalnie) Jeśli chcesz osobny plik: 
```ts
import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '.env') })
```


### Krok 3: Załaduj .env w global-setup

Plik: `memo-words/e2e/global-setup.ts`

- Dodaj na górze pliku, przed użyciem `process.env`:
```ts
import 'dotenv/config'
```


### Krok 4: Ujednolicenie nazw zmiennych i bezpieczeństwo

Plik: `memo-words/e2e/global-setup.ts`, w `performUiLoginAndSaveState(...)`:

- Zastąp odczyt loginu/hasła na tolerancyjny (obsługa obu prefiksów):
```ts
const email = process.env.VITE_E2E_USERNAME || process.env.E2E_USERNAME || process.env.E2E_EMAIL
const password = process.env.VITE_E2E_PASSWORD || process.env.E2E_PASSWORD
if (!email || !password) {
  throw new Error('Brak VITE_E2E_USERNAME/E2E_USERNAME i/lub VITE_E2E_PASSWORD/E2E_PASSWORD w zmiennych środowiskowych.')
}
```

- Usuń `console.log` wypisujące `email`/`password`.

### Krok 5: Konfiguracja .env

Plik: `memo-words/.env`

```env
VITE_API_BASE_URL=https://localhost:7048
VITE_E2E_USERNAME=twoj_user@test.com
VITE_E2E_PASSWORD=twoje_haslo
```

- Upewnij się, że `.env` jest ignorowany przez Git.

### Krok 6: Weryfikacja lokalna

- Usuń ew. stary stan: `rm -rf memo-words/e2e/.auth` (Windows: usuń folder ręcznie).
- Uruchom testy: 
```bash
cd memo-words
npx playwright test
```

- Oczekiwane: global-setup zaloguje użytkownika, zapisze `e2e/.auth/storageState.json`, testy przejdą.

### Krok 7: CI (opcjonalnie)

- W CI ustaw zmienne środowiskowe (`VITE_E2E_USERNAME`, `VITE_E2E_PASSWORD`, `VITE_API_BASE_URL`) jako sekrety środowiskowe lub załaduj z pliku `.env` w kroku build/test.

### To-dos

- [x] Dodać global-setup z logowaniem i czyszczeniem danych przez API
- [x] Skonfigurować storageState i globalSetup w playwright.config.ts
- [x] Dodać util do odczytu tokenu ze storageState.json
- [x] Dodać util API (list/delete cards) dla testów E2E
- [x] Dodać CardsListPagePO do operacji/asercji na liście
- [x] Napisać cards.add.spec.ts (manual + AI) z asercjami UI i API
- [x] Napisać cards.validation.spec.ts (puste źródło, disabled, liczniki)
- [x] Napisać cards.edit.spec.ts (edycja targetu i weryfikacja API)
- [x] Napisać cards.cancel.spec.ts (Anuluj nie tworzy karty)
- [x] (Opcjonalnie) Napisać cards.delete.spec.ts (UI usuwanie + API potwierdzenie)