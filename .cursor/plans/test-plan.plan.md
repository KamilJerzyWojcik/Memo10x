<!-- 91e5960d-803d-4b6d-ae6a-e0f832f74f45 223bfe90-8a34-4535-9be1-566bd97009ed -->
# Plan testów MemoWords

### 1. Wprowadzenie i cele testowania

- **Cel główny**: Zapewnienie, że aplikacja MemoWords działa poprawnie, bezpiecznie i wydajnie w kontekście: rejestracji/logowania (Supabase), zarządzania kartami (CRUD), generowania tłumaczeń (AI), autoryzacji (JWT) i UX/UI.
- **Krytyczne założenia**:
- Frontend (React 19, Vite, TS, Tailwind, shadcn/ui) komunikuje się z backendem przez `apiClient` (nagłówek Authorization: Bearer, obsługa 401 → redirect).
- Backend (ASP.NET Core 9, EF Core) weryfikuje Supabase JWT i autoryzuje dostęp do `CardsController` oraz `AiController`. Limitowanie zapytań do AI (30/min na użytkownika).
- Dane w Supabase PostgreSQL, walidacja po obu stronach: zod (FE) i FluentValidation (BE).

### 2. Zakres testów

- **Frontend** (`memo-words/`):
- Routing i ochrona tras (`router.tsx`, `RequireAuth.tsx`).
- Autentykacja z Supabase (`LoginPage.tsx`, `RegisterPage.tsx`, `AuthContext.tsx`).
- Warstwa API (`services/apiClient.ts`, `cardsApi.ts`, `aiApi.ts`).
- Ekrany i logika domenowa kart (`CardsPage.tsx`, `AddCardPage.tsx`, `EditCardPage.tsx`, `CardForm.tsx`).
- Walidacje formularzy (`validation/forms.ts`, `fields.ts`).
- **Backend** (`MemoWords/MemoWords.Api/`):
- Konfiguracja i middleware (CORS, JWT, Rate Limiter) w `Program.cs`.
- Kontrolery: `CardsController.cs`, `AiController.cs`, `SystemController.cs`.
- Serwisy domenowe: `CardService`, `AiTranslationService` (+ obsługa wyjątków AiServiceException).
- Warstwa danych: `ApplicationDbContext`, migracje, konfiguracje encji.
- Walidacje (`Application/Validation/*`).
- **Integracje**: Supabase Auth, PostgreSQL (EF Core), OpenAI (mock w testach), CORS.

### 3. Typy testów do przeprowadzenia

- **Testy statyczne**:
- Frontend: ESLint + TypeScript.
- Backend: .NET Analyzers/nullable + StyleCop (opcjonalnie).
- **Testy jednostkowe**:
- FE: logika komponentów/konektorów (np. `apiClient` – nagłówki/401/redirect), walidacje zod, komponenty formularzy.
- BE: serwisy (`CardService`, `IAiTranslationService` – mock), walidatory FluentValidation, mapowania DTO.
- **Testy integracyjne**:
- FE: współpraca `apiClient` z MSW (mock API), `AuthContext` + `RequireAuth`, routing (`LoginRoute`, returnUrl, sessionStorage).
- BE: `WebApplicationFactory` + Testcontainers (PostgreSQL) lub InMemory; override DI na `MockUserContext` i mock `IAiTranslationService`.
- **Testy kontraktowe API**:
- Weryfikacja zgodności OpenAPI (Swagger) ze stanem kontrolerów; schematy i kody odpowiedzi.
- **Testy E2E (end-to-end)**:
- Playwright: pełne ścieżki użytkownika (rejestracja → logowanie → lista → dodanie → edycja → usunięcie), scenariusze 401/redirect.
- **Testy wydajnościowe**:
- k6: latencja i przepustowość dla `/api/v1/cards` (GET/POST/PATCH/DELETE) i `/api/v1/ai/translate`, weryfikacja polityki rate limit (HTTP 429 po 30 żądaniach/min).
- **Testy bezpieczeństwa**:
- Autentykacja/Autoryzacja (JWT: issuer, audience, podpis), CORS (dozwolone originy), skan OWASP ZAP (XSS/CSRF/headers).
- **Testy dostępności (a11y)**:
- axe-core: etykiety, aria-atributy, kontrasty, fokus w formularzach i przy redirectach.
- **Testy regresyjne**: zestaw smoke + krytyczne ścieżki po zmianach.

### 4. Scenariusze testowe dla kluczowych funkcjonalności

- **Autentykacja i routing**
- Wejście na `/cards` bez zalogowania → `RequireAuth` przekierowuje na `/login`, zapamiętanie `returnUrl` (sessionStorage).
- Logowanie poprawne: Supabase `signInWithPassword` → toast success, redirect na `returnUrl` lub `/`.
- Logowanie błędne: komunikat błędu z Supabase → toast error.
- Rejestracja poprawna: `signUp` → toast success, redirect do `/login` (przekazanie `returnUrl`).
- Wylogowanie: `AuthContext.signOut` → powrót do stanu niezalogowanego, zablokowany dostęp do tras chronionych.
- **Warstwa HTTP (`apiClient.ts`)**
- Dołączenie Bearer token (Supabase session lub `utils/auth.ts`) do żądania.
- Na 401: zapis `returnUrl`, `window.location.replace('/login')` i rzucony `ApiError(401)`.
- Mapowanie błędów: 4xx/5xx → `ApiError` z treścią odpowiedzi.
- **Lista kart (`CardsPage.tsx`)**
- Domyślne pobranie: `page=1`, `pageSize=10`; render paginacji i elementów.
- Błędne parametry (np. `pageSize` spoza [10,50,100]) → 400 z BE, toast „Przywróć domyślne” i reset stanu.
- Usuwanie karty: stany busy/confirm, 404 → toast „Odświeżono”, inne błędy → możliwość ponowienia.
- Zachowanie scrolla i highlight nowo utworzonej/edytowanej karty.
- **Dodawanie karty (`AddCardPage.tsx`)**
- Walidacja pól (zod) i komunikaty w UI; brak możliwości submitu przy błędach.
- Generowanie AI: sukces → uzupełnione tłumaczenie; 429/502/504 → odpowiedni toast i retry.
- Anulowanie poprzedniego żądania (AbortController) przy kolejnym kliknięciu „Generuj”.
- Zapis (POST) → na sukces nawigacja z highlight nowej karty.
- **Edycja karty (`EditCardPage.tsx`)**
- Pobranie karty (GET): 404 → redirect z ostrzeżeniem; 401 → toast o wygaśnięciu sesji.
- Delta update (PATCH tylko zmienione pola), walidacje jak wyżej.
- Generowanie AI i obsługa błędów/rate-limit jak w dodawaniu.
- **Backend – Cards API**
- Wymagana autoryzacja: żądania bez Bearer → 401.
- GET listy: poprawne stronicowanie (page, pageSize), pola `total`, `hasNextPage`.
- GET by id: 404 dla kart innego użytkownika lub nieistniejących.
- POST: walidacje (min/max długości), przypisanie do bieżącego usera.
- PATCH: tylko zmienione pola, 404 gdy brak uprawnień lub brak karty.
- DELETE: 204 na sukces, 404 gdy brak.
- **Backend – AI API**
- POST `/api/v1/ai/translate`: poprawny wynik (200) i kształt odpowiedzi.
- Rate limiting: 31. żądanie w minucie → 429.
- Błędy usług AI: 502/504 mapowane na ProblemDetails; nieprzewidziane → 500.
- **System health i CORS**
- GET `/health` (AllowAnonymous) → 200 i poprawny DTO czasu.
- CORS: dozwolone originy (`http://localhost:5173`, `http://localhost:4173`); inne originy blokowane.

### 5. Środowisko testowe

- **Lokalne DEV**:
- FE: Vite (`npm run dev`) na `http://localhost:5173`.
- BE: ASP.NET (`https://localhost:7048`, `http://localhost:5180`; Swagger pod `/swagger`).
- Zmienne środowiskowe FE: `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Supabase: projekt testowy i konta testowe; klucze tylko dla środowiska testowego.
- **Testy integracyjne BE**:
- Testcontainers (PostgreSQL) + migracje EF Core per test suite.
- Override DI: `IUserContext` → `MockUserContext`; `IAiTranslationService` → stub/deterministyczny mock.
- **E2E**:
- Playwright z mockami sieci (MSW/Playwright route) dla AI/Supabase, lub środowisko testowe z danymi seed.

### 6. Narzędzia do testowania

- **Frontend**: Vitest, @testing-library/react, @testing-library/user-event, MSW, Playwright, ESLint, jest-axe/axe-playwright.
- **Backend**: xUnit, FluentAssertions, Microsoft.AspNetCore.Mvc.Testing, DotNet.Testcontainers, Npgsql, Bogus (dane testowe), Respawn (reset DB).
- **API/kontrakty**: Swashbuckle (Swagger), schemathesis lub Dredd (opcjonalnie), openapi-typescript (walidacja zgodności typów FE z OpenAPI).
- **Wydajność**: k6 (skrypty w JS), opcjonalnie Artillery.
- **Bezpieczeństwo**: OWASP ZAP baseline, SAST/Dependency scan (np. GitHub Dependabot/CodeQL).

### 7. Harmonogram testów (propozycja)

- Tydz. 1: Setup narzędzi, testy statyczne i jednostkowe (FE/BE), smoke API.
- Tydz. 2: Testy integracyjne (FE/BE), scenariusze CRUD kart + AI w mocku.
- Tydz. 3: E2E Playwright (pełne ścieżki), regresja, a11y.
- Tydz. 4: Wydajność (k6), bezpieczeństwo (ZAP), stabilizacja i poprawki.

### 8. Kryteria akceptacji testów

- 0 błędów o ważności Critical/High w ścieżkach: logowanie, lista, dodanie, edycja, usunięcie, tłumaczenie.
- Pokrycie minimalne: BE serwisy/validatorzy ≥ 85%, FE logika formularzy i `apiClient` ≥ 80%.
- E2E: 100% scenariuszy krytycznych przechodzi (logowanie → CRUD kart → AI → wylogowanie).
- Wydajność: P95 < 300 ms dla GET /cards, P95 < 800 ms dla POST /ai/translate (z mockiem/stubem w testach wydajnościowych środowiskowych – realne limity do uzgodnienia produkcyjnego).
- Bezpieczeństwo: brak wykrytych podatności High w skanie ZAP; CORS i JWT zgodnie z konfiguracją.

### 9. Role i odpowiedzialności

- **QA Lead**: planowanie, priorytetyzacja, przegląd przypadków, koordynacja regresji.
- **QA Engineer**: implementacja testów (FE/BE/E2E), raportowanie defektów, metryki.
- **Backend Dev**: wsparcie kontraktów API, mock/stub usług, naprawa defektów BE.
- **Frontend Dev**: testy komponentów, naprawa defektów FE, dostępność.
- **DevOps**: integracja testów w CI/CD (Azure DevOps), sekretów i środowisk.

### 10. Procedury raportowania błędów

- **Kanał**: Azure DevOps/GitHub Issues (jedno źródło prawdy).
- **Szablon zgłoszenia**: kroki reprodukcji, oczekiwane vs rzeczywiste, logi (bez PII/sekretów), zrzuty ekranu/har/log.
- **Priorytety**: Critical/High/Medium/Low; SLA naprawy uzależnione od ważności i wpływu.
- **Traceability**: powiązanie defektu z commitem/PR-em; test regresyjny dodany przy naprawie.
- **Zamykanie**: weryfikacja przez QA (testy jednostkowe/integracyjne/E2E) i smoke po wdrożeniu.

### To-dos

- [ ] Skonfiguruj narzędzia testowe (Vitest/RTL/MSW, xUnit/Testcontainers, Playwright, k6, ZAP)
- [ ] Napisz testy jednostkowe FE (apiClient, formularze, walidacje, routing)
- [ ] Napisz testy jednostkowe BE (CardService, walidatory, mapowania DTO)
- [ ] Napisz testy integracyjne FE z MSW (AuthContext, RequireAuth, scenariusze 401/redirect)
- [ ] Napisz testy integracyjne BE z Testcontainers (CRUD kart, mock AI, auth)
- [ ] Weryfikuj kontrakty Swagger vs implementacja i typy FE
- [ ] Zaimplementuj testy E2E Playwright (rejestracja, logowanie, CRUD, AI, logout)
- [ ] Przeprowadź testy wydajności k6 (listy kart, AI translate, limit 429)
- [ ] Uruchom testy bezpieczeństwa ZAP + weryfikacja JWT/CORS/headers
- [ ] Uruchom testy dostępności (axe) i popraw zgłoszenia