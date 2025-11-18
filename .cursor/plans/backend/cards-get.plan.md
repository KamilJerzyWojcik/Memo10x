<!-- 9ffa051a-9555-4e2d-a42c-4ff98290bb60 21490975-fd6b-425a-8308-8da8ed0eb7e9 -->
# API Endpoint Implementation Plan: GET /api/v1/cards

## 1. Przegląd punktu końcowego

Punkt końcowy zwraca paginowaną listę kart należących do bieżącego użytkownika. Wyniki są posortowane malejąco po createdAt (z tie-breakerem po id). Autoryzacja wymagana; w środowisku developerskim mockujemy użytkownika stałym GUID.

## 2. Szczegóły żądania

- Metoda HTTP: GET
- Struktura URL: /api/v1/cards
- Parametry:
- Wymagane: —
- Opcjonalne:
- page: int, domyślnie 1, min 1
- pageSize: int, dozwolone 10 (domyślnie), 50, 100
- Request Body: brak
- Uwierzytelnianie: wymagane (docelowo JWT Supabase; tymczasowo `MockUserContext` z GUID: d8985899-2145-4139-a92e-1e35b8bc6f83)

## 3. Wykorzystywane typy

- DTO odpowiedzi elementu: `Application/DTOs/CardDto` (już istnieje)
- Koperta listy: `Application/DTOs/PagedResultDto<TItem>` (dodać właściwość `IReadOnlyList<TItem> Items`)
- DTO zapytania (FromQuery): `Application/Requests/GetCardsQuery`
- Właściwości: `int Page {get; init;} = 1; int PageSize {get; init;} = 10;`
- Walidator: `Application/Validation/GetCardsQueryValidator`
- Zasady: `Page >= 1`; `PageSize ∈ {10,50,100}`
- Serwis aplikacyjny: `Application/Services/ICardService`
- Nowa metoda: `Task<PagedResultDto<CardDto>> GetCardsAsync(Guid userId, int page, int pageSize, CancellationToken ct)`

## 4. Szczegóły odpowiedzi

- 200 OK (application/json):
- Struktura:
- items: CardDto[]
- page: number
- pageSize: number
- total: number (łączna liczba rekordów użytkownika)
- hasNextPage: boolean (czy istnieje kolejna strona)
- Błędy:
- 400 Bad Request — nieprawidłowe `page`/`pageSize` (ProblemDetails)
- 401 Unauthorized — brak/nieważny JWT (w mocku niewymuszane; docelowo przez `[Authorize]`)
- 500 Internal Server Error — nieoczekiwany błąd serwera/DB

## 5. Przepływ danych

1) HTTP GET /api/v1/cards -> `CardsController.List([FromQuery] GetCardsQuery)`
2) `IUserContext.GetCurrentUserId()` pobiera GUID użytkownika (mock/JWT)
3) `ICardService.GetCardsAsync(userId, page, pageSize)`
4) EF Core query do `ApplicationDbContext.Cards` z filtracją `UserId == userId`, sortowaniem `CreatedAt DESC, Id DESC`, `AsNoTracking()`, `Skip/Take`, projekcja bezpośrednio do `CardDto` po stronie DB (`Select`)
5) Obliczenie `total` i `hasNextPage`, złożenie `PagedResultDto<CardDto>`
6) `Ok(...)` z JSON (camelCase)

## 6. Względy bezpieczeństwa

- Filtrowanie zawsze po `UserId == currentUserId` w warstwie aplikacji (nie polegamy na RLS, bo używamy poświadczeń serwisowych)
- Docelowo: `[Authorize]` + walidacja JWT względem Supabase JWKS; w dev: `MockUserContext`
- Nie logujemy treści pól tekstowych (PII) — logujemy tylko identyfikatory i metadane
- Domyślne limity `pageSize` chronią przed nadmiernym obciążeniem
- Mapowanie/projekcja do DTO zapobiega wyciekom pól wewnętrznych

## 7. Obsługa błędów

- 400: Błędy walidacji `GetCardsQuery` (FluentValidation) — automatyczny zwrot ProblemDetails (AddFluentValidationAutoValidation)
- 401: Brak autoryzacji (po włączeniu JWT `[Authorize]`); w trybie mock — n/d
- 500: Wyjątki serwera/DB — globalny middleware/filtr wyjątków (w projekcie) + `ILogger` (poziom Error) z korelacją żądania

## 8. Rozważania dotyczące wydajności

- EF: `AsNoTracking()` dla odczytu; projekcja LINQ bezpośrednio do DTO minimalizuje alokacje i transfer
- Paginacja: offsetowa `Skip/Take`; `hasNextPage = page * pageSize < total`

## 9. Etapy wdrożenia

1. Dodaj DTO zapytania

- Plik: `Application/Requests/GetCardsQuery.cs`
- Właściwości: `Page = 1`, `PageSize = 10`

2. Dodaj walidator

- Plik: `Application/Validation/GetCardsQueryValidator.cs`
- Reguły: `Page >= 1`; `PageSize ∈ {10,50,100}`

3. Uzupełnij kopertę paginacji

- Zaktualizuj `Application/DTOs/PagedResultDto.cs` o `IReadOnlyList<TItem> Items { get; init; }`

4. Rozszerz serwis kart

- `ICardService`: nowa sygnatura `GetCardsAsync(...)`
- `CardService`: implementacja z dwoma zapytaniami (count + page) i projekcją do `CardDto`

5. Dodaj akcję kontrolera

- Plik: `Controllers/CardsController.cs`
- `[HttpGet]` `List([FromQuery] GetCardsQuery query, CancellationToken ct)`
- Pobranie `userId` z `IUserContext`, wywołanie serwisu, `return Ok(result)`

6. Kontrakt i dokumentacja

- Atrybuty `[ProducesResponseType]` (200, 400, 401)
- Sprawdzenie w Swaggerze

7. Testy manualne

- Scenariusze: domyślne, `page=2`, `pageSize=50`, walidacja `page=0`, `pageSize=999`

### To-dos

- [ ] Dodać GetCardsQuery z domyślnymi Page=1, PageSize=10
- [ ] Dodać GetCardsQueryValidator dla page i pageSize
- [ ] Uzupełnić PagedResultDto<T> o Items
- [ ] Dodać ICardService.GetCardsAsync i implementację w CardService
- [ ] Dodać GET /api/v1/cards w CardsController.List
- [ ] Sprawdzić endpoint w Swaggerze dla różnych parametrów