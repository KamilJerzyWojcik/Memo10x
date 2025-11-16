# Plan REST API

Wersja: v1  
Odbiorcy: Zespoły backend (.NET 9, EF Core, Supabase) i frontend (Angular 20)  
Uwierzytelnianie: Supabase JWT (Authorization: Bearer <token>) walidowany w backendzie względem Supabase JWKS

## 1. Zasoby

- Karty — Baza danych: `public.cards`
  - Karty słownictwa należące do użytkownika (EN → PL).
  - Własność wymuszana w backendzie filtrowaniem po `sub`/`uid` z JWT.
  - Ograniczenia DB: przycięte, niepuste stringi, długość 1–500, znaczniki czasu.
  - Zapytania główne: lista użytkownika z sortowaniem `created_at DESC, id DESC`, paginacja 10/50/100.

- Zdarzenia — Baza danych: `public.events`
  - Telemetria produktowa do metryk akceptacji i zdrowia.
  - RLS wyłączony; zapis tylko przez backend (frontend wywołuje backend).
  - Typy (enum `public.event_type`): `generate_clicked`, `translate_generated`, `translate_failed`, `card_added_after_generate`, `edit_saved`, `delete_confirmed`, `dialog_add_canceled`.

- AI Translate — Usługa (bez tabeli)
  - Generuje propozycję tłumaczenia przez AI; narazie bedzie mock ktory zwraca tekst "Example text AI".
  - Emituje zdarzenia (`translate_generated` lub `translate_failed`) z opcjonalnym `ai_model`, `error_code`.

- Auth — Oparte o Supabase
  - JWT; backend udostępnia `whoami` do introspekcji sesji po stronie klienta.

- Health — Usługa (bez tabeli)
  - Endpoint żywotności/gotowości dla infrastruktury.

## 2. Punkty końcowe

Uwagi:
- Wszystkie odpowiedzi są w JSON, chyba że wskazano inaczej.
- Wszystkie ciała żądań w JSON z `Content-Type: application/json`.
- Wersjonowanie API: prefiks URL `/api/v1/...`.
- Błędy: RFC 7807 Problem Details (`application/problem+json`).
- Czas: ISO 8601 w UTC (np. `2025-11-16T14:52:00Z`).
- Identyfikatory: UUID v4.

### 2.1 Karty

JSON encji (odpowiedź):
```json
{
  "id": "uuid",
  "sourceText": "string",
  "targetText": "string",
  "createdAt": "2025-11-16T14:52:00Z",
  "updatedAt": "2025-11-16T14:52:00Z"
}
```

Koperta listy:
```json
{
  "items": [ { "...card..." } ],
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "hasNextPage": true
}
```

- GET /api/v1/cards
  - Opis: Lista kart bieżącego użytkownika posortowana po `createdAt DESC`.
  - Uwierzytelnianie: Wymagane.
  - Parametry zapytania:
    - `page` (int, domyślnie 1, min 1)
    - `pageSize` (int, dozwolone: 10 [domyślnie], 50, 100)
  - Sukces 200:
    - Treść: Koperta listy (powyżej)
  - Błędy:
    - 400 (nieprawidłowe `page`/`pageSize`)
    - 401 (brak/nieważny JWT)

- GET /api/v1/cards/{id}
  - Opis: Pobierz pojedynczą kartę należącą do bieżącego użytkownika.
  - Uwierzytelnianie: Wymagane.
  - Ścieżka:
    - `id` (uuid)
  - Sukces 200: JSON karty
  - Błędy:
    - 401, 404 (brak uprawnień lub nie znaleziono)

- POST /api/v1/cards
  - Opis: Utwórz kartę dla bieżącego użytkownika.
  - Uwierzytelnianie: Wymagane.
  - Żądanie:
    ```json
    {
      "sourceText": "string (1..500, po przycięciu niepusty)",
      "targetText": "string (1..500, po przycięciu niepusty)"
    }
    ```
  - Sukces 201:
    - Treść: JSON karty
  - Błędy:
    - 400 (walidacja)
    - 401 (brak autoryzacji)
    - 409 (konflikt idempotencji)

- PATCH /api/v1/cards/{id}
  - Opis: Częściowa aktualizacja pól karty użytkownika; loguje `edit_saved`.
  - Uwierzytelnianie: Wymagane.
  - Ścieżka: `id` (uuid)
  - Żądanie (wymagane = oba pola):
    ```json
    {
      "sourceText": "string (1..500, opcjonalnie)",
      "targetText": "string (1..500, opcjonalnie)"
    }
    ```
  - Sukces 200:
    - Treść: JSON karty (z odświeżonym `updatedAt`)
  - Błędy:
    - 400 (nieprawidłowe dane; brak pól lub naruszenie ograniczeń)
    - 401, 404 (brak uprawnień lub nie znaleziono)
    - 412 (niespełniony warunek wstępny przy niezgodnym ETag)

- DELETE /api/v1/cards/{id}
  - Opis: Trwałe usunięcie karty użytkownika; loguje `delete_confirmed`.
  - Uwierzytelnianie: Wymagane.
  - Ścieżka: `id` (uuid)
  - Sukces 204 (bez treści)
  - Błędy:
    - 401, 404

### 2.2 Zdarzenia (Telemetria)

JSON encji (odpowiedź):
```json
{
  "id": "uuid",
  "userId": "uuid|null",
  "type": "generate_clicked",
  "createdAt": "2025-11-16T14:52:00Z",
  "cardId": "uuid|null",
  "errorCode": "string|null",
}
```

- POST /api/v1/events
  - Opis: Zarejestruj zdarzenie telemetryczne produktu. Zdarzenia użytkownika wymagają JWT; backend ustawia `userId` na podstawie tokena.
  - Uwierzytelnianie: Wymagane dla zdarzeń użytkownika.
  - Żądanie:
    ```json
    {
      "type": "generate_clicked | translate_generated | translate_failed | card_added_after_generate | edit_saved | delete_confirmed | dialog_add_canceled",
      "cardId": "uuid (opcjonalnie)",
      "errorCode": "string (opcjonalnie, <=100 znaków)",
    }
    ```
  - Sukces 202 (accepted; semantyka fire-and-forget)
  - Błędy:
    - 400 (nieprawidłowy typ/kształt danych)
    - 401 (brak/nieważny JWT dla zdarzeń od użytkownika)
    - 429 (ograniczenie szybkości)


### 2.3 AI Translate

- POST /api/v1/ai/translate
  - Opis: Wygeneruj polskie tłumaczenie dla wejścia EN z użyciem mocka; loguje `translate_generated` przy sukcesie lub `translate_failed` przy błędzie.
  - Uwierzytelnianie: Wymagane.
  - Żądanie:
    ```json
    {
      "sourceText": "string (1..500, po przycięciu niepusty)",
      "model": "string (opcjonalnie; serwer może nadpisać)",
    }
    ```
  - Sukces 200:
    ```json
    {
      "translation": "string",
      "durationMs": 1234
    }
    ```
  - Błędy:
    - 400 (walidacja)
    - 401 (brak autoryzacji)
    - 429 (rate limit)
    - 502/504 (błąd/timeout usługi AI; zdarzenie `translate_failed` z `errorCode`)

### 2.4 Auth (pomocnicze)

- GET /api/v1/auth/whoami
  - Opis: Zwraca roszczenia tożsamości wyekstrahowane z poprawnie zwalidowanego JWT.
  - Uwierzytelnianie: Wymagane.
  - Sukces 200:
    ```json
    {
      "userId": "uuid",
      "email": "user@example.com",
      "issuedAt": "2025-11-16T14:00:00Z",
      "expiresAt": "2025-11-23T14:00:00Z"
    }
    ```
  - Błędy: 401

### 2.5 Health

- GET /health
  - Opis: Sonda żywotności/gotowości.
  - Uwierzytelnianie: Brak.
  - Sukces 200:
    ```json
    {
      "status": "ok",
      "version": "1.0.0",
      "time": "2025-11-16T14:52:00Z"
    }
    ```

## 3. Uwierzytelnianie i Autoryzacja

- Mechanizm: Supabase JWT w nagłówku `Authorization: Bearer <token>`.
  - Backend waliduje podpis tokena względem Supabase JWKS (keszuje klucze; respektuje rotację).
  - Odczyt roszczeń (np. `sub` jako `userId`, `email`).
- Autoryzacja:
  - Wszystkie endpointy `/api/v1/*` wymagają ważnego JWT, oprócz `/health`.
- Dostęp do bazy:
  - Backend używa poświadczeń serwisowych do Supabase Postgres.
  - Izolacja użytkownika w warstwie aplikacji dla `cards` przez filtr `user_id = <jwt.userId>`.
  - `events` zapisywane wyłącznie przez backend (brak bezpośredniego dostępu klienta do DB).
- CORS:
  - Tylko zaufane pochodzenia frontendu.
  - Dozwolone nagłówki: `Authorization`, `Content-Type`.
- Transport:
  - Wyłącznie HTTPS/TLS.

## 4. Walidacja i Logika Biznesowa

### 4.1 Reguły walidacji

Wspólne:
- `id`, `userId`, `cardId` muszą być ważnymi UUID, jeśli występują.
- Znaczniki czasu generowane na serwerze (`createdAt`, `updatedAt`) i niemodyfikowalne przez klienta (poza odczytem).

Karty:
- `sourceText`: wymagane przy tworzeniu i aktualizacji; po przycięciu długość 1..500; niepuste po przycięciu.
- `targetText`: wymagane przy tworzeniu i aktualizacji; po przycięciu długość 1..500; niepuste po przycięciu.
- `page`: liczba całkowita >= 1; domyślnie 1.
- `pageSize`: jedna z wartości 10, 50, 100; domyślnie 10.
- Sortowanie: stałe `createdAt DESC`.
- Własność: wszystkie operacje zawężone do `jwt.userId`.
- `updatedAt`: ustawiane po stronie serwera przy tworzeniu/aktualizacji na `UtcNow`.

Zdarzenia:
- `type`: jedna z dozwolonych wartości enum:
  - `generate_clicked`, `translate_generated`, `translate_failed`, `card_added_after_generate`, `edit_saved`, `delete_confirmed`, `dialog_add_canceled`.
- `errorCode`: opcjonalny tekst (<=100 znaków).
- Zdarzenia użytkownika: wymagają JWT; backend ustawia `userId` z tokena; nie przyjmować `userId` z klienta.

AI Translate:
- `sourceText`: wymagane; te same ograniczenia co pola karty (1..500 po przycięciu).

### 4.2 Logika biznesowa

- Karty
  - Create: Insert z `user_id = jwt.userId`. Zwraca utworzoną kartę. Egzekwuje przycięcia i ograniczenia.
  - Update: Aktualizuje tylko przekazane pola. `updatedAt` ustawiane na czas serwera. 412 przy konflikcie.
  - Delete: Twarde usunięcie; zwraca 204.

- Zdarzenia
  - Przyjmuj, waliduj, zapisuj. 202 do odsprzęglenia latencji zapisu. `userId` wyłącznie pochodne z JWT.

- AI Translate
  - Waliduj wejście; wywołuj mock. Przy sukcesie zwracaj tłumaczenie i emituj `translate_generated`; przy błędzie/timeout emituj `translate_failed` z `errorCode` i zwracaj adekwatny status (preferuj 504 dla timeout).


### 4.3 Obsługa błędów (Problem Details)

Format:
```json
{
  "title": "Validation error",
  "status": 422,
  "detail": "sourceText must be 1..500 chars",
  "errors": {
    "sourceText": ["Must be between 1 and 500 characters"]
  }
}
```

Standardowe statusy:
- 200 OK — Pomyślne pobranie.
- 201 Created — Pomyślne utworzenie (karty).
- 202 Accepted — Przetwarzanie asynchroniczne (zdarzenia).
- 204 No Content — Pomyślne usunięcie.
- 400 Bad Request — Błędne dane (np. zły UUID).
- 401 Unauthorized — Brak/nieważny JWT.
- 403 Forbidden — Brak uprawnień (admin).
- 404 Not Found — Nie znaleziono/nie należy do użytkownika.
- 409 Conflict — Konflikt idempotencji lub konkurencji.
- 412 Precondition Failed — Niezgodny ETag.
- 422 Unprocessable Entity — Błędy walidacji.
- 429 Too Many Requests — Limit szybkości przekroczony.
- 5xx — Błędy serwera lub zewnętrznych usług.

### 4.4 Wydajność i bezpieczeństwo

- Wydajność zapytań DB
  - Używaj `Include()` tylko gdy potrzebne; domyślnie `AsNoTracking()` do odczytów.
  - Endpoint listy używa `ORDER BY created_at DESC` oraz `Skip/Take` (paginacja offsetowa).

- Bezpieczeństwo
  - Walidacja JWT względem Supabase JWKS; keszowanie i respektowanie rotacji.
  - Nie ufaj `userId` od klienta; zawsze pochodne z JWT.
  - Restrykcyjny CORS; tylko HTTPS; limity rozmiaru JSON; przycinanie i limity długości wejścia.
  - Nie ujawniaj kluczy roli serwisowej Supabase do frontendu.

### 4.5 DTO i walidacja (uwagi implementacyjne)

- Użyj FluentValidation dla DTO żądań:
  - `CreateCardRequest` { `sourceText`, `targetText` }
  - `UpdateCardRequest` { `sourceText`, `targetText` }
  - `CreateEventRequest` { `type`, `cardId?`, `errorCode?` }
  - `TranslateRequest` { `sourceText` }
- Stosuj strażników (guard clauses); szybkie zwroty dla stanów niepoprawnych.
- MediatR do obsługi command/query; repozytoria do persystencji.
- `updatedAt` ustawiane w kodzie (bez triggerów DB).

## 5. Przykłady

Przykład — Utworzenie karty (201):
```json
POST /api/v1/cards
{
  "sourceText": "take off",
  "targetText": "zdejmować (ubranie)"
}
```
```json
201 Created
{
  "id": "b2a7b372-1b7d-4a33-9a7b-3ae2d9e64a1e",
  "sourceText": "take off",
  "targetText": "zdejmować (ubranie)",
  "createdAt": "2025-11-16T14:52:00Z",
  "updatedAt": "2025-11-16T14:52:00Z"
}
```

Przykład — Lista kart (200):
```json
GET /api/v1/cards?page=1&pageSize=10
```
```json
200 OK
{
  "items": [
    {
      "id": "b2a7b372-1b7d-4a33-9a7b-3ae2d9e64a1e",
      "sourceText": "take off",
      "targetText": "zdejmować (ubranie)",
      "createdAt": "2025-11-16T14:52:00Z",
      "updatedAt": "2025-11-16T14:52:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "hasNextPage": false
}
```

Przykład — AI Translate (200):
```json
POST /api/v1/ai/translate
{
  "sourceText": "break down",
}
```
```json
200 OK
{
  "translation": "zepsuć się; załamać się",
}
```

Przykład — Zdarzenie (202):
```json
POST /api/v1/events
{
  "type": "generate_clicked",
}
```
```json
202 Accepted
{}
```

## 6. Pytania otwarte / Założenia

- Internacjonalizacja komunikatów błędów: API zwraca techniczne błędy po angielsku (ProblemDetails). Frontend mapuje na polskie komunikaty UI.
- Użyto paginacji offsetowej z numerami stron.


