# API Endpoint Implementation Plan: POST /api/v1/cards

## 1. Przegląd punktu końcowego

Tworzy nową kartę słownictwa (EN → PL) przypisaną do bieżącego użytkownika. Zwraca 201 Created z utworzoną kartą i nagłówkiem Location do zasobu.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- Struktura URL: /api/v1/cards
- Uwierzytelnianie: Wymagane (na ten etap zamockowane stałym identyfikatorem użytkownika Supabase)
- Nagłówki: Content-Type: application/json
- Parametry:
- Wymagane: brak parametrów URL/Query
- Opcjonalne: brak
- Request Body (JSON):
{
"sourceText": "string (1..500, po przycięciu niepusty)",
"targetText": "string (1..500, po przycięciu niepusty)"
}
- Walidacja wejścia:
- Trim obu pól; po przycięciu: długość 1..500 i niepusty (nie tylko spacje)
- Odmowa klawisza (400) na naruszenia; wykorzystać FluentValidation + automatyczne 400 od [ApiController]

## 3. Wykorzystywane typy

- DTO:
- `Application/DTOs/CardDto.cs` (już istnieje)
- Request/Command:
- `Application/Requests/CreateCardRequest.cs` (już istnieje; rozszerzamy walidacją FluentValidation)
- (Bez MediatR w tej iteracji; prosty serwis aplikacyjny)
- Serwisy i narzędzia (nowe):
- `Application/Services/ICardService.cs`, `Application/Services/CardService.cs`
- `Application/Validation/CreateCardRequestValidator.cs` (FluentValidation)
- `Application/Mappers/CardMapper.cs` (mapowanie encja → DTO)
- `Infrastructure/Auth/IUserContext.cs`, `Infrastructure/Auth/MockUserContext.cs` (mock użytkownika)

## 4. Szczegóły odpowiedzi

- Sukces 201 Created
- Treść: `CardDto`
- Nagłówki: `Location: /api/v1/cards/{id}`
- Błędy:
- 400 ValidationProblemDetails (automatycznie z [ApiController] + FluentValidation)
- 401 Unauthorized (brak użytkownika z kontekstu — w praktyce nie wystąpi przy mocku)
- 500 ProblemDetails (błąd serwera / bazy)

### Przykładowa odpowiedź 201

{
"id": "1f25c7a2-...",
"sourceText": "apple",
"targetText": "jabłko",
"createdAt": "2025-11-16T15:00:00Z",
"updatedAt": "2025-11-16T15:00:00Z"
}

## 5. Przepływ danych

1. Kontroler `CardsController.Create` odbiera `CreateCardRequest` (JSON)
2. [ApiController] + FluentValidation: walidacja (trim, długości, niepustość) — w razie naruszeń 400
3. `IUserContext` dostarcza `Guid currentUserId` (mock: d8985899-2145-4139-a92e-1e35b8bc6f83)
4. `ICardService.CreateCardAsync(userId, source, target)` tworzy encję `Card`, przypisuje `UserId`, dodaje do DbContext, zapisuje
5. EF Core ustawia `id`, `created_at`, `updated_at` (konfiguracja już istnieje); `ApplicationDbContext` aktualizuje `UpdatedAt`
6. Mapowanie encji do `CardDto`
7. Zwracamy 201 Created z treścią i nagłówkiem Location

## 6. Względy bezpieczeństwa

- Autentykacja: tymczasowy mock `IUserContext` z ustalonym `Guid` użytkownika Supabase (tylko DEV). Produkcyjnie: walidacja JWT przez JWK Supabase i mapowanie roszczeń na `UserId`.
- Autoryzacja: RLS w `public.cards` wymusi widoczność wyłącznie własnych rekordów w Supabase. Backend zawsze zapisuje `user_id` z kontekstu.
- Walidacja wejścia: twarde reguły (trim + 1..500), eliminacja treści pustych/blank
- Brak ujawniania wewnętrznych szczegółów błędów: ProblemDetails bez stack trace

## 7. Obsługa błędów

- 400: naruszenia walidacji (np. puste po trim, >500) — ValidationProblemDetails
- 401: brak użytkownika (fallback ścieżka — nie spodziewana przy mocku)
- 500: wyjątki EF/DB (np. połączenie), niespodziewane błędy aplikacji
- Telemetria błędów: brak dedykowanego typu `EventType` dla tworzenia kart — na tym etapie nie zapisujemy do `public.events`; rely na logach ASP.NET Core

## 8. Rozważania dotyczące wydajności

- Dodaj `CancellationToken` w całym łańcuchu (kontroler → serwis → EF)
- Unikaj zbędnych zapytań (tylko `Add` + `SaveChangesAsync`)

## 9. Etapy wdrożenia

1. Mock kontekstu użytkownika

- Dodać `Infrastructure/Auth/IUserContext` z `Guid GetCurrentUserId()`
- Dodać `Infrastructure/Auth/MockUserContext` zwracający stały `Guid("d8985899-2145-4139-a92e-1e35b8bc6f83")`
- Rejestracja DI w `Program.cs` (transition)

2. Walidacja wejścia

- Dodać `FluentValidation` (pakiet + rejestracja)
- Utworzyć `CreateCardRequestValidator` (trim + długość 1..500 + niepustość po trim)

3. Serwis aplikacyjny

- `ICardService` z `Task<Card> CreateCardAsync(Guid userId, string source, string target, CancellationToken ct)`
- Implementacja `CardService` (wstrzyknięty `ApplicationDbContext`, `ILogger`)

4. Mapowanie encji

- Dodać statyczny mapper `CardMapper.ToDto(Card)`

5. Kontroler

- Utworzyć `Controllers/CardsController.cs` z `[ApiController]`, `[Route("api/v1/cards")]`
- `[HttpPost]` `Create(CreateCardRequest request, CancellationToken ct)`
- Pobranie `userId` z `IUserContext`, wywołanie serwisu, mapowanie do `CardDto`, zwrot `Created($"/api/v1/cards/{dto.Id}", dto)`

6. Rejestracje w `Program.cs`

- `services.AddControllers()` (już jest)
- Rejestracje DI: `IUserContext`, `ICardService`, FluentValidation

7. Testy

- Test walidatora (przypadki: spacje-only, >500, poprawne)
- dodać swagger do testów manualnych

8. Manualne sprawdzenie

-test przez sagger potwierdzić 201 + zapis w DB