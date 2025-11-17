<!-- daa897a9-bcb7-47fa-95c8-4c504466dbe2 7c395e83-fa0a-42da-9435-99e6e72edc06 -->
# API Endpoint Implementation Plan: POST /api/v1/ai/translate

## 1. Przegląd punktu końcowego

Punkt końcowy generuje tłumaczenie EN→PL przy użyciu serwisu AI (w tej iteracji: mock). Zwraca jedynie tłumaczenie; loguje telemetrię do `public.events`. Docelowo wymaga Supabase JWT (teraz: `MockUserContext`).

## 2. Szczegóły żądania

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/v1/ai/translate`
- **Nagłówki**:
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (w dev MockUserContext dostarcza `userId` bez realnego JWT)
- **Parametry**:
- **Wymagane**: `sourceText` (string, po trim długość 1..500, niepusty po trim)
- **Opcjonalne**: `model` (string; serwer może nadpisać; ograniczyć długość do ≤100)
- **Body (JSON)**:
{
"sourceText": "string (1..500, po przycięciu niepusty)",
"model": "string (opcjonalny)"
}
- **Rate limiting (plan)**: stałe okno na użytkownika (np. 30/min), kod 429 przy przekroczeniu.

## 3. Wykorzystywane typy

- **DTO**:
- `TranslateRequestDto` → `Application/Requests/Ai/TranslateRequestDto.cs`
- `string SourceText`
- `string? Model`
- `TranslateResponseDto` → `Application/DTOs/Ai/TranslateResponseDto.cs`
- `string Translation`
- **Serwis AI**:
- `IAiTranslationService` → `Application/Services/IAiTranslationService.cs`
- `Task<AiTranslationResult> TranslateAsync(string sourceText, string? model, CancellationToken ct)`
- `MockAiTranslationService` → `Application/Services/MockAiTranslationService.cs`
- Deterministyczne tłumaczenie mock; zwraca `AiTranslationResult { string Translation, string ModelUsed, TimeSpan Duration }`
- `AiServiceException` → `Application/Services/Exceptions/AiServiceException.cs`
- Właściwości: `string ErrorCode`, `bool IsTimeout`
- **Telemetria zdarzeń**:
- `IEventService` → `Application/Services/IEventService.cs`
- `Task LogAsync(EventType type, Guid? userId, Guid? cardId, string? errorCode, string? aiModel, JsonDocument? meta, CancellationToken ct)`
- `EventService` → `Application/Services/EventService.cs`
- **Encje** (już istnieją): `Event`, `EventType` (używamy: `GenerateClicked`, `TranslateGenerated`, `TranslateFailed`).
- **Walidator**:
- `TranslateRequestValidator` → `Application/Validation/TranslateRequestValidator.cs`

## 4. Szczegóły odpowiedzi

- **Sukces 200**:
{
"translation": "string"
}
- **Błędy**:
- 400: naruszenie walidacji wejścia (FluentValidation)
- 401: brak autoryzacji (docelowo przy realnym JWT; w dev raczej nie wystąpi)
- 429: przekroczony limit zapytań
- 502: błąd serwisu AI (np. błąd modelu)
- 504: timeout serwisu AI
- 500: nieoczekiwany błąd serwera

## 5. Przepływ danych

1. `AiController.Translate` pobiera `userId` z `IUserContext` i `TranslateRequestDto` z body.
2. Walidacja `TranslateRequestValidator` (auto przez FluentValidation).
3. `IEventService.LogAsync(GenerateClicked, userId, null, null, null, meta)` gdzie `meta` zawiera: `{ source_length, model_requested }` (bez raw tekstu).
4. `IAiTranslationService.TranslateAsync(sourceText, model)` zwraca `AiTranslationResult`.
5. `IEventService.LogAsync(TranslateGenerated, userId, null, null, modelUsed, meta)` z `{ duration_ms, source_length, translation_length }`.
6. HTTP 200 z `TranslateResponseDto { translation }`.
7. W przypadku wyjątku `AiServiceException`:

- `TranslateFailed` + `error_code`, `ai_model?`, `meta` (`duration_ms`, `source_length`).
- Mapowanie: `IsTimeout` → 504, inne → 502.

8. W przypadku innego wyjątku: log + `TranslateFailed` (error_code="unhandled") → 500.

## 6. Względy bezpieczeństwa

- **Dane wrażliwe**: nie zapisywać pełnego `sourceText` w `events.meta`; przechowywać tylko długość i opcjonalnie hash (SHA-256) — rekomendacja.
- **Rate limiting**: per użytkownik (klucz z `userId`), minimalizuje nadużycia i koszty.
- **Timeouty i anulowanie**: propagować `CancellationToken` do serwisów.
- **Autoryzacja**: obecnie `MockUserContext`; po wdrożeniu Supabase JWT endpoint dostaje `[Authorize]` i wczytuje `UserId` z tokena.
- **Walidacja wejścia**: early return na 400; anty-DoS przez limity i limity długości.

## 7. Obsługa błędów

- 400: naruszenia walidacyjne (`sourceText` puste po trim, długość poza 1..500, `model` zbyt długie).
- 401: brak/niepoprawny JWT (docelowo; w dev nie wystąpi przez mock).
- 429: `EnableRateLimiting("translate")` + polityka w `Program.cs`.
- 502: błąd serwisu AI (np. `AiServiceException` bez timeoutu).
- 504: timeout serwisu AI (`AiServiceException.IsTimeout=true`).
- 500: nieobsłużone wyjątki, zwracane z generycznego handlera; zapis `TranslateFailed` z `error_code = "unhandled"`.

## 8. Rozważania dotyczące wydajności

- **Rate limiter**: stałe okno (np. 30/min) z partycjonowaniem po `userId` (FixedWindowLimiter). 
- **Szybkie DTO/JSON**: proste kształty, brak zbędnych pól.
- **Krótki timeout serwisu**: np. 10s; w mock brak zewnętrznych wywołań.
- **AsNoTracking**: dotyczy odczytów; tu zapisujemy `Event` (lightweight).
- **Batch/Fire-and-forget?**: Zdarzenia zapisywać synchronicznie dla spójności; w przyszłości można buforować.

## 9. Etapy wdrożenia

1. **DTO**: dodać `TranslateRequestDto`, `TranslateResponseDto`.
2. **Walidacja**: `TranslateRequestValidator` (trim, 1..500, niepusty; `model` ≤100).
3. **Serwis AI**: interfejs `IAiTranslationService`; implementacja `MockAiTranslationService` (zwraca deterministyczne tłumaczenie i `modelUsed`).
4. **Serwis zdarzeń**: `IEventService` + `EventService` (wstrzyknięty `ApplicationDbContext`, `ILogger`).
5. **Kontroler**: `Controllers/AiController.cs` z `[ApiController]`, `[Route("api/v1/ai")]`, `[HttpPost("translate")]`.
6. **Rate limiting**: w `Program.cs` skonfigurować politykę `translate` (FixedWindow per `userId`) i oznaczyć akcję.
7. **DI**: rejestracje w `Program.cs`: `IAiTranslationService`, `IEventService` (scoped/singleton odpowiednio), `EnableRateLimiting` middleware.
8. **Logowanie**: użyć `ILogger` w kontrolerze i serwisach, logi na poziomie Information/Warning/Error.
9. **Swagger**: uzupełnić opis endpointu (request/response, kody błędów), ręcznie przetestować 200/400/429/502/504.
10. **Testy**: test walidatora; test kontrolera (sukces i scenariusze błędów) z mockami serwisów.

### To-dos

- [ ] Dodać TranslateRequestDto i TranslateResponseDto
- [ ] Utworzyć TranslateRequestValidator (trim, 1..500, model ≤100)
- [ ] Dodać IAiTranslationService i MockAiTranslationService
- [ ] Dodać IEventService i EventService zapisujący zdarzenia
- [ ] Utworzyć AiController z POST /api/v1/ai/translate
- [ ] Skonfigurować politykę rate limiting 'translate' w Program.cs
- [ ] Zarejestrować serwisy AI i Event w DI + middleware RL
- [ ] Uzupełnić dokumentację Swagger dla endpointu i błędów
- [ ] Dodać testy walidatora i kontrolera (sukces/błędy)