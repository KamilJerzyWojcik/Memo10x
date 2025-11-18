<!-- cc34e42c-b06c-442a-a1cd-7be8d022fc43 c5653697-e322-40e1-9df7-7f2b83d2097d -->
# API Endpoint Implementation Plan: PATCH /api/v1/cards/{id}

### 1. Przegląd punktu końcowego

Częściowa aktualizacja karty słownictwa użytkownika (EN→PL) z odświeżeniem `updatedAt`. Uwierzytelnianie tymczasowo zamockowane na stałe `userId` dla środowiska dev/test.

### 2. Szczegóły żądania 

- **Metoda HTTP**: PATCH
- **URL**: `/api/v1/cards/{id}` 
- **Parametry**:
  - **Wymagane (path)**: `id: uuid`
  - **Opcjonalne (body)**: `sourceText?: string`, `targetText?: string`
- **Wymogi walidacyjne body**:
  - Co najmniej jedno z pól (`sourceText` lub `targetText`) musi być obecne.
  - Każde obecne pole po trimie: długość 1..500 znaków.
- **Przykład body**:
```json
{
  "sourceText": "apple",
  "targetText": "jabłko"
}
```


### 3. Wykorzystywane typy

- **Request DTO**: `UpdateCardRequestDto { string? SourceText; string? TargetText; }`
- **Response DTO**: istniejący `CardDto` (tworzony z `Card.CreateCardDto()`).
- **MediatR**:
  - `UpdateCardCommand(Guid CardId, Guid UserId, string? SourceText, string? TargetText) : IRequest<CardDto>`
  - `UpdateCardCommandHandler : IRequestHandler<UpdateCardCommand, CardDto>`
- **Validator (FluentValidation)**: `UpdateCardRequestValidator : AbstractValidator<UpdateCardRequestDto>`

### 4. Szczegóły odpowiedzi

- **200 OK**: JSON `CardDto` z zaktualizowanymi polami i odświeżonym `UpdatedAt`.
- **400 Bad Request**: naruszenie walidacji (brak pól, whitespace-only, długość poza zakresem).
- **401 Unauthorized**: brak tożsamości użytkownika (gdy mock wyłączony).
- **404 Not Found**: karta nie istnieje lub nie należy do użytkownika.
- **500 Internal Server Error**: nieoczekiwany błąd serwera.

### 5. Przepływ danych

1. Kontroler (`CardsController`) odbiera PATCH z `id` w ścieżce i body `UpdateCardRequestDto`.
2. Walidacja wejścia (FluentValidation). W razie błędu → 400.
3. Pobranie `userId`:

   - DEV/TEST: z mocku (stały GUID `d8985899-2145-4139-a92e-1e35b8bc6f83`).
   - PROD: z tokena JWT (Supabase) – poza zakresem tego zadania, ale endpoint [Authorize].

4. Wysłanie `UpdateCardCommand` przez MediatR.
5. Handler:

   - Pobiera encję `Card` ograniczając po `Id` i `UserId` (własność użytkownika).
   - Jeśli brak → 404.
   - Trimuje wejście; aktualizuje tylko pola obecne i zmienione.
   - Ustawia `UpdatedAt = DateTimeOffset.UtcNow` jeżeli cokolwiek się zmieniło.
   - Zapisuje transakcyjnie zmiany (EF Core, jedno `SaveChangesAsync`).
   - Zwraca `CardDto` z encji (`Card.CreateCardDto()`).

### 6. Względy bezpieczeństwa

- **Autoryzacja**: Endpoint oznaczony `[Authorize]`. W DEV mock włączany wyłącznie warunkowo (np. env `AUTH_MOCK_USER_ID`).
- **Własność zasobu**: zapytanie do DB zawsze filtruje po `Id` i `UserId`.
- **Maskowanie informacji**: dla cudzych zasobów zwracamy 404.
- **Walidacja danych**: trim i limity długości 1..500; odrzucenie pustych wartości.

### 7. Obsługa błędów

- 400: brak jakichkolwiek pól, pola tylko whitespace, długość <1 lub >500 po trimie.
- 401: brak kontekstu użytkownika (mock wyłączony i brak JWT).
- 404: karta nieistniejąca lub nie należąca do użytkownika.
- 500: nieoczekiwany wyjątek – logowanie poprzez `ILogger`, bez ujawniania szczegółów.

### 8. Rozważania dotyczące wydajności

- Zapytanie pobierające kartę bez `Include` relacji (lekka encja); `AsTracking()` dla aktualizacji.
- Aktualizacja tylko zmienionych pól; jeśli brak zmian, zwracamy 200 bez zapisu.
- Operacje atomowe w jednym `SaveChangesAsync`.

### 9. Etapy wdrożenia

1. Dodaj DTO żądania `UpdateCardRequestDto` w `MemoWords.Api/Application/DTOs/`.
2. Dodaj walidator `UpdateCardRequestValidator` (FluentValidation) w `.../Application/Validators/`:

   - Co najmniej jedno pole wymagane.
   - Każde obecne: `Trim()`, `Length 1..500`.

3. Dodaj `UpdateCardCommand` i `UpdateCardCommandHandler` w `.../Application/Cards/`.

   - Handler: pobierz kartę po `Id` i `UserId`; zastosuj zmiany; ustaw `UpdatedAt`; `SaveChangesAsync`.

4. Rozszerz repozytoria/DbContext (jeśli wymagane) o metody: `GetByIdForUserAsync`.
5. Kontroler `CardsController`:

   - `[Authorize]`, `[HttpPatch("api/v1/cards/{id}")]`.
   - Mapowanie body→command i wysłanie przez MediatR.
   - Mapowanie wyniku do `CardDto` (z encji).

6. Mock uwierzytelnienia (DEV only): middleware lub serwis `ICurrentUserService` zwracający stały GUID z env `AUTH_MOCK_USER_ID = d8985899-2145-4139-a92e-1e35b8bc6f83`.
7. Rejestracja DI: MediatR, FluentValidation, repozytoria/serwisy, `ICurrentUserService`.
8. Testy:

   - Validator: scenariusze 400 (brak pól, whitespace, długość).
   - Handler: 404 dla cudzej i nieistniejącej karty; 200 ze zmianą obu/jednego pola; 200 bez zmian (brak zapisu i eventu).
   - Kontroler: integracyjne 200/400/404.

9. Dokumentacja: opis endpointu i przykład w README/Swagger.

### 10. Kluczowe pliki do zmiany/dodania

- `MemoWords/MemoWords.Api/Controllers/CardsController.cs` (nowa akcja PATCH)
- `MemoWords/MemoWords.Api/Application/DTOs/UpdateCardRequestDto.cs`
- `MemoWords/MemoWords.Api/Application/Validators/UpdateCardRequestValidator.cs`
- `MemoWords/MemoWords.Api/Application/Cards/UpdateCardCommand.cs`
- `MemoWords/MemoWords.Api/Application/Cards/UpdateCardCommandHandler.cs`
- (opcjonalnie) `MemoWords/MemoWords.Api/Application/Abstractions/ICurrentUserService.cs` + implementacja dev mock
- (jeśli brak) metody w repo/DbContext dla pobrania i zapisu eventu

### To-dos

- [ ] Dodać UpdateCardRequestDto z polami opcjonalnymi
- [ ] Dodać UpdateCardRequestValidator z regułami 1..500 i min. jedno pole
- [ ] Dodać UpdateCardCommand oraz handler z logiką aktualizacji
- [ ] Zapewnić metody pobrania po Id+User i zapis eventu
- [ ] Dodać akcję PATCH w CardsController z [Authorize]
- [ ] Dodać dev-only mock ICurrentUserService z stałym GUID z env
- [ ] Zarejestrować MediatR, FluentValidation, serwisy w DI
- [ ] Napisać testy validatora, handlera i kontrolera
- [ ] Zaktualizować dokumentację/Swagger o PATCH /api/v1/cards/{id}