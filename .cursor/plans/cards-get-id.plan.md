<!-- a32f7074-fa08-4db3-9c97-70c0af2dd77d 4ed98106-aaf9-4430-9ae1-5f5a3432df03 -->
# API Endpoint Implementation Plan: GET /api/v1/cards/{id}

## 1. Przegląd punktu końcowego

Punkt końcowy zwraca pojedynczą kartę słownictwa, o ile należy do bieżącego użytkownika. Środowisko deweloperskie korzysta z mockowanego kontekstu użytkownika (stały user_id z Supabase), a docelowo zostanie podmienione na weryfikację JWT.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: /api/v1/cards/{id}
- Parametry:
- Wymagane: id (uuid, segment ścieżki)
- Opcjonalne: brak
- Nagłówki: Authorization: Bearer <token> (docelowo); w dev – mock.
- Request Body: brak

## 3. Wykorzystywane typy

- DTO: `Application/DTOs/CardDto`
- Encje: `Domain/Entities/Card`
- Serwis: `Application/Services/ICardService`, `Application/Services/CardService`
- Mapper: `Application/Mappers/CardMapper`
- Kontekst: `Infrastructure/Persistence/ApplicationDbContext`
- Kontekst użytkownika (mock): `Infrastructure/Auth/IUserContext`, `MockUserContext`

## 3. Szczegóły odpowiedzi

- 200 OK: JSON `CardDto` z polami: `id`, `sourceText`, `targetText`, `createdAt`, `updatedAt`
- 400 Bad Request: niepoprawny format `id` (niewalidowalny GUID; zapewni to `{id:guid}` + [ApiController])
- 401 Unauthorized: brak tożsamości (docelowo, po włączeniu JWT)
- 404 Not Found: karta nie istnieje lub nie należy do użytkownika
- 500 Internal Server Error: nieoczekiwany błąd po stronie serwera

## 4. Przepływ danych

1) `CardsController.GetById(id)` pobiera `userId` z `IUserContext` (dev: `MockUserContext`).
2) Wywołanie `ICardService.GetCardByIdAsync(userId, id)` filtruje po `userId` i `id` w `ApplicationDbContext.Cards` (z `AsNoTracking`).
3) W przypadku trafienia: mapowanie `Card` → `CardDto` (`CardMapper.ToDto`) i zwrot 200.
4) Brak trafienia: 404.
5) Błędy niespodziewane: log i 500.

## 5. Względy bezpieczeństwa

- Kontrola dostępu po stronie serwisu: `WHERE c.UserId == userId AND c.Id == id` zapobiega IDOR.
- Dla zasobów cudzych – zwracamy 404 (utrudnia enumerację identyfikatorów).
- Dev: mockowany `IUserContext` zwraca stałe `Guid`. Prod: JWT + `[Authorize]` + walidacja JWK (zgodnie z CLAUDE.md).

## 6. Obsługa błędów

- Walidacja `id` przez `{id:guid}` i [ApiController] → 400.
- Brak zasobu lub cudzy zasób → 404.
- Błędy niespodziewane → 500 + log przez `ILogger` z korelacją `UserId`, `CardId`.
- Brak dedykowanej telemetrii `Event` dla odczytu – log wystarcza (brak zdarzeń w `EventType` dla „view”).

## 7. Rozważania dotyczące wydajności

- `AsNoTracking()` dla zapytania tylko-do-odczytu.

## 8. Etapy wdrożenia

1) Serwis – interfejs:

- Plik: `Application/Services/ICardService.cs`
- Dodaj: `Task<Card?> GetCardByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken);`
2) Serwis – implementacja:
- Plik: `Application/Services/CardService.cs`
- Implementuj metodę:
- `return await _dbContext.Cards.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId, cancellationToken);`
- Loguj trafienie/brak trafienia (Information/Warning).
3) Kontroler – akcja GET by id:
- Plik: `Controllers/CardsController.cs`
- Dodaj metodę:
- `[HttpGet("{id:guid}")]`
- Sygnatura: `public async Task<ActionResult<CardDto>> GetById([FromRoute] Guid id, CancellationToken ct)`
- Kroki: pobierz `userId` → `service.GetCardByIdAsync(...)` → `if null => NotFound()` → mapuj `CardMapper.ToDto(card)` → `Ok(dto)`
- Loguj (Information dla 200, Warning dla 404)
4) Swagger/UI: automatycznie odświeży się dzięki `app.MapControllers()` i `AddSwaggerGen()`.
5) Manualny smoke-test (dev):
- Utwórz kartę POST-em; skopiuj `id` z odpowiedzi 201.
- Wywołaj `GET /api/v1/cards/{id}` i sprawdź 200 oraz zgodność pól DTO.
- Sprawdź: niepoprawny GUID → 400; nieistniejący `id` → 404.
6) (Po wdrożeniu auth) – Włączyć `[Authorize]` na kontrolerze/akcji i skonfigurować JWT z walidacją JWK Supabase; zachować filtrację po `userId`.




### To-dos

- [ ] Dodać GetCardByIdAsync do ICardService
- [ ] Zaimplementować GetCardByIdAsync w CardService z AsNoTracking i logowaniem
- [ ] Dodać akcję [HttpGet("{id:guid}")] GetById do CardsController
- [ ] Zweryfikować opis endpointu w Swagger i ręcznie przetestować 200/400/404
- [ ] Przygotować follow-up na integrację JWT i [Authorize]