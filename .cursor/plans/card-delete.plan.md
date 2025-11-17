<!-- 1af75fe3-65df-4212-99c6-cf371ecaaf35 826bc98d-7c21-4eb3-804d-b61966387387 -->
# API Endpoint Implementation Plan: DELETE /api/v1/cards/{id}

## 1. Przegląd punktu końcowego

Punkt końcowy trwale usuwa kartę słownictwa należącą do bieżącego użytkownika. W środowisku developerskim tożsamość 
użytkownika jest mockowana (`MockUserContext`). W produkcji będzie używane JWT (Supabase) – filtr własności po `userId` zapobiega IDOR.

## 2. Szczegóły żądania

- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/v1/cards/{id}`
- **Parametry**:
  - **Wymagane**: `id` (uuid, segment ścieżki; walidacja przez `{id:guid}` + `[ApiController]`)
  - **Opcjonalne**: brak
- **Request Body**: brak
- **Uwierzytelnianie**: wymagane docelowo (JWT). Dla dev używamy `MockUserContext` (stały GUID).

## 3. Wykorzystywane typy

- **Encje domenowe**: `Domain/Entities/Card`, `Domain/Entities/Event`, `Domain/Entities/EventType`
- **Serwis aplikacyjny**: `Application/Services/ICardService`, `Application/Services/CardService`
- **Kontekst EF**: `Infrastructure/Persistence/ApplicationDbContext` (`DbSet<Card>`, `DbSet<Event>`)
- **Kontroler**: `Controllers/CardsController`
- **DTO**: brak (endpoint bez ciała i bez treści odpowiedzi)

## 3. Szczegóły odpowiedzi

- **204 No Content** – karta usunięta pomyślnie (bez treści)
- **400 Bad Request** – nieprawidłowy `id` (niewalidowalny GUID; egzekwuje `{id:guid}`)
- **401 Unauthorized** – brak/nieważny JWT (docelowo; w dev mock zawsze zwróci `userId`)
- **404 Not Found** – karta nie istnieje lub nie należy do użytkownika
- **500 Internal Server Error** – nieoczekiwany błąd serwera/DB (zwracany jako ProblemDetails)

## 4. Przepływ danych

1. `CardsController.Delete(id)` pobiera `userId` z `IUserContext` (dev: stały GUID).
2. Wywołuje `ICardService.DeleteCardAsync(userId, id, ct)`.
3. Serwis wykonuje kasowanie w DB zawężone do `(UserId == userId && Id == id)`;

   - Preferencyjnie używa `ExecuteDeleteAsync` (bez pobierania encji), zwraca liczbę usuniętych wierszy.

4. Jeśli usunięto ≥ 1:

   - Zwraca `true` → kontroler odpowiada `204`.

5. Jeśli nie znaleziono wiersza (`0`) → serwis zwraca `false` → kontroler odpowiada `404`.

## 5. Względy bezpieczeństwa

- **IDOR**: wszystkie operacje filtrowane po `userId` z kontekstu – nigdy nie kasujemy po samym `id`.
- **Autoryzacja**: w produkcji `[Authorize]` oraz walidacja JWT (Supabase JWKS). Dla dev – `MockUserContext` zapewnia deterministyczny `userId`.
- **Jawność informacji**: zwracamy `404` bez ujawniania, czy `id` istnieje globalnie.
- **Transport i CORS**: tylko HTTPS; CORS ograniczony do zaufanych originów; brak wrażliwych danych w odpowiedzi.

## 6. Obsługa błędów

- **400**: niewłaściwy GUID (automatycznie przez `{id:guid}` i `[ApiController]`).
- **404**: brak rekordu dla `(userId, id)`.
- **500**: wyjątki EF/DB – logowane i zwracane jako ProblemDetails (spójnie z resztą API).

## 7. Rozważania dotyczące wydajności

- **Kasowanie bez SELECT**: `ExecuteDeleteAsync` na zapytaniu zawężonym po `userId` i `id` – unika round-trip na SELECT, jest O(1) dla klucza.
- **Indeksy**: kasowanie po PK (`cards.id`) – optymalne. Dodatkowe indeksy niepotrzebne.
- **Brak `Include()`**: brak relacji do ładowania. Telemetria `events` zapisywana osobno (INSERT).
- **AsNoTracking**: nie dotyczy kasowania — i tak używamy `ExecuteDeleteAsync`.

## 8. Etapy wdrożenia

1. Rozszerz interfejs serwisu

   - Plik: `MemoWords/MemoWords.Api/Application/Services/ICardService.cs`
   - Dodaj sygnaturę:
```csharp
Task<bool> DeleteCardAsync(Guid userId, Guid id, CancellationToken cancellationToken);
```


2. Implementuj kasowanie w serwisie

   - Plik: `MemoWords/MemoWords.Api/Application/Services/CardService.cs`
   - Implementacja (z użyciem EF Core 9):
```csharp
public async Task<bool> DeleteCardAsync(Guid userId, Guid id, CancellationToken ct)
{
    var deleted = await _dbContext.Cards
        .Where(c => c.Id == id && c.UserId == userId)
        .ExecuteDeleteAsync(ct);

    if (deleted == 0)
    {
        _logger.LogWarning("Card {CardId} not found for user {UserId} when deleting", id, userId);
        return false;
    }

    // Telemetria po sukcesie (bez CardId; zachowujemy id w meta)
    var meta = JsonDocument.Parse($"{{\"deletedCardId\":\"{id}\"}}");
    _dbContext.Events.Add(new Event
    {
        UserId = userId,
        Type = EventType.DeleteConfirmed,
        CardId = null,
        Meta = meta
    });
    await _dbContext.SaveChangesAsync(ct);

    _logger.LogInformation("Card {CardId} deleted for user {UserId}", id, userId);
    return true;
}
```


3. Dodaj akcję w kontrolerze

   - Plik: `MemoWords/MemoWords.Api/Controllers/CardsController.cs`
```csharp
[HttpDelete("{id:guid}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken ct)
{
    var userId = _userContext.GetCurrentUserId();
    var deleted = await _cardService.DeleteCardAsync(userId, id, ct);
    if (!deleted) return NotFound();
    return NoContent();
}
```


4. Dokumentacja i kontrakt

   - Upewnij się, że Swagger generuje wpis dla DELETE z kodami 204/404/401.
   - Zachowaj spójność z `ProblemDetails` dla błędów (400/500).

5. Testy manualne (Swagger lub HTTP client)

   - Usunięcie istniejącej karty użytkownika → 204, kolejne wywołanie → 404.
   - Niepoprawny GUID (np. `id=abc`) → 400.

6. Uwagi wdrożeniowe

   - Brak migracji DB (tabele i enum już istnieją).
   - W produkcji dodać `[Authorize]` i walidację JWT (Supabase JWKS).
   - Brak zmian w DI — `CardService` i `MockUserContext` już zarejestrowane w `Program.cs`.

### To-dos

- [ ] Dodać DeleteCardAsync do ICardService
- [ ] Zaimplementować DeleteCardAsync w CardService z ExecuteDeleteAsync i telemetrią
- [ ] Dodać akcję [HttpDelete] w CardsController i kody 204/404/401
- [ ] Sprawdzić Swagger: DELETE /api/v1/cards/{id} z poprawnymi statusami
- [ ] Wykonać testy manualne: 204/404/400 oraz zapis zdarzenia